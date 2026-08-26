package com.finora.controller;

import com.finora.ai.*;
import com.finora.brain.BrainResponse;
import com.finora.brain.FinoraBrain;
import com.finora.database.*;
import com.finora.model.UserProfile;
import com.finora.service.AuthService;
import com.finora.service.BackupService;
import com.finora.service.FinanceService;
import com.finora.service.UserSessionContext;
import com.finora.util.AppPaths;
import javafx.application.Platform;
import javafx.concurrent.Task;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.Callable;
import java.util.function.Consumer;

public final class AppController {
    public record BootProgress(String title, String detail, double progress, int step) {}
    public record BootstrapResult(boolean hasUsers, UserProfile rememberedUser) {}

    @FunctionalInterface
    public interface CheckedAction {
        void run() throws Exception;
    }

    private final DatabaseManager database = DatabaseManager.getInstance();
    private final H2ConnectionProvider localProvider = new H2ConnectionProvider(AppPaths.dataDirectory());
    private final UserSessionContext userSession = new UserSessionContext();
    private final AuthService auth = new AuthService(localProvider);
    private final FinanceService finance = new FinanceService(database, userSession);
    private final FinoraBrain brain = new FinoraBrain(finance);
    private final BackupService backups = new BackupService(database, AppPaths.backupDirectory());
    // Identity, AI memory and conversations remain in the authenticated local vault even
    // when an optional MySQL financial workspace is selected.
    private final AIMemoryService aiMemory = new AIMemoryService(localProvider);
    private final ConversationService aiConversations = new ConversationService(localProvider);
    private final AISettingsService aiSettings = new AISettingsService(localProvider);
    private final FinoraAIEngine ai = new FinoraAIEngine(new FinancialToolService(finance), aiMemory, aiConversations, aiSettings);
    private volatile FinoraBrain.BrainState state;
    private volatile UserProfile currentUser;
    private volatile Task<?> activeAITask;

    public DatabaseManager database() { return database; }
    public FinanceService finance() { return finance; }
    public FinoraBrain brain() { return brain; }
    public BackupService backups() { return backups; }
    public FinoraBrain.BrainState state() { return state; }
    public AIMemoryService aiMemory() { return aiMemory; }
    public ConversationService aiConversations() { return aiConversations; }
    public AISettingsService aiSettings() { return aiSettings; }
    public UserProfile currentUser() { return currentUser; }

    /** Initializes H2 and validates a revocable remembered-device session. */
    public void bootstrap(Consumer<BootProgress> progress, Consumer<BootstrapResult> success,
                          Consumer<Throwable> error) {
        runTask(() -> {
            report(progress, "Preparing local storage", "Checking the FINORA application-data directory", .12, 1);
            DatabaseInitializer.initialize(localProvider);
            report(progress, "Embedded database ready", "H2 schema and local records validated", .46, 1);
            boolean hasUsers = auth.hasUsers();
            report(progress, "Checking secure session", "Looking for a remembered device token", .68, 2);
            UserProfile remembered = hasUsers ? auth.tryRememberedSignIn().orElse(null) : null;
            currentUser = remembered;
            if (remembered == null) userSession.clear(); else userSession.activate(remembered.id());
            report(progress, remembered == null ? "Sign in required" : "Device recognized",
                    remembered == null ? "Your password remains stored only as a derived hash" : "Restored a revocable local session",
                    .84, 2);
            return new BootstrapResult(hasUsers, remembered);
        }, success, error);
    }

    public void register(String displayName, String username, char[] password, boolean remember,
                         Consumer<UserProfile> success, Consumer<Throwable> error) {
        runTask(() -> {
            UserProfile profile = auth.register(displayName, username, password);
            currentUser = profile;
            userSession.activate(profile.id());
            configureRememberWithoutBlockingSignIn(profile, remember);
            return profile;
        }, success, error);
    }

    public void signIn(String username, char[] password, boolean remember,
                       Consumer<UserProfile> success, Consumer<Throwable> error) {
        runTask(() -> {
            UserProfile profile = auth.authenticate(username, password);
            currentUser = profile;
            userSession.activate(profile.id());
            configureRememberWithoutBlockingSignIn(profile, remember);
            return profile;
        }, success, error);
    }

    public void loadWorkspace(Consumer<BootProgress> progress, Consumer<FinoraBrain.BrainState> success,
                              Consumer<Throwable> error) {
        runTask(() -> {
            report(progress, "Opening financial records", "Reading accounts, schedules and obligations", .22, 3);
            DatabaseInitializer.initialize(database);
            report(progress, "Running FINORA Brain", "Calculating cash flow, plan health and priorities", .58, 3);
            state = brain.analyze();
            report(progress, "Workspace ready", "All calculations completed locally", 1, 3);
            return state;
        }, success, error);
    }

    /** Retained for integration clients; the desktop shell uses bootstrap + local sign in. */
    public void initialize(Consumer<FinoraBrain.BrainState> success, Consumer<Throwable> error) {
        runTask(() -> {
            DatabaseInitializer.initialize(database);
            state = brain.analyze();
            return state;
        }, success, error);
    }

    public void signOut(Runnable success, Consumer<Throwable> error) {
        runTask(() -> {
            auth.clearRememberedSession();
            database.use(localProvider);
            state = null;
            currentUser = null;
            userSession.clear();
            return null;
        }, ignored -> success.run(), error);
    }

    public void resetToLocal(Runnable success, Consumer<Throwable> error) {
        runTask(() -> {
            database.use(localProvider);
            state = null;
            return null;
        }, ignored -> success.run(), error);
    }

    public void refresh(Consumer<FinoraBrain.BrainState> success, Consumer<Throwable> error) {
        runTask(() -> {
            state = brain.analyze();
            return state;
        }, success, error);
    }

    public void execute(CheckedAction action, Runnable success, Consumer<Throwable> error) {
        runTask(() -> {
            action.run();
            return null;
        }, ignored -> {
            state = null;
            success.run();
        }, error);
    }

    public void ask(String question, Consumer<BrainResponse> success, Consumer<Throwable> error) {
        runTask(() -> brain.ask(question), success, error);
    }

    public void askAI(Long conversationId, String question, Consumer<FinoraAIEngine.Stage> status,
                      Consumer<FinoraAIEngine.Answer> success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        Task<FinoraAIEngine.Answer> task = new Task<>() {
            @Override protected FinoraAIEngine.Answer call() throws Exception {
                return ai.ask(userId, conversationId, question,
                        stage -> { if (!isCancelled() && status != null) Platform.runLater(() -> status.accept(stage)); });
            }
        };
        activeAITask = task;
        task.setOnSucceeded(event -> { activeAITask = null; success.accept(task.getValue()); });
        task.setOnFailed(event -> { activeAITask = null; error.accept(task.getException()); });
        task.setOnCancelled(event -> activeAITask = null);
        Thread.ofVirtual().name("finora-brain").start(task);
    }

    public void stopAI() {
        Task<?> task = activeAITask;
        if (task != null) task.cancel(true);
    }

    public void listAIConversations(String search, Consumer<List<ConversationService.Conversation>> success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> aiConversations.list(userId, search), success, error);
    }

    public void loadAIConversation(long conversationId, Consumer<List<ConversationService.ChatMessage>> success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> aiConversations.messages(userId, conversationId), success, error);
    }

    public void deleteAIConversation(long conversationId, Runnable success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> { aiConversations.delete(userId, conversationId); return null; }, ignored -> success.run(), error);
    }

    public void listAIMemory(Consumer<List<AIMemoryService.Memory>> success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> aiMemory.list(userId), success, error);
    }

    public void updateAIMemory(long memoryId, String value, Runnable success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> { aiMemory.update(userId, memoryId, value); return null; }, ignored -> success.run(), error);
    }

    public void deleteAIMemory(long memoryId, Runnable success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> { aiMemory.delete(userId, memoryId); return null; }, ignored -> success.run(), error);
    }

    public void clearAIMemory(Runnable success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> { aiMemory.clear(userId); return null; }, ignored -> success.run(), error);
    }

    public void loadAISettings(Consumer<AISettingsService.Settings> success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> aiSettings.get(userId), success, error);
    }

    public void saveAISettings(AISettingsService.Settings settings, Runnable success, Consumer<Throwable> error) {
        long userId = requireUser().id();
        runTask(() -> { aiSettings.update(userId, settings); return null; }, ignored -> success.run(), error);
    }

    private UserProfile requireUser() {
        UserProfile user = currentUser;
        if (user == null) throw new IllegalStateException("Sign in before using FINORA BRAIN.");
        return user;
    }

    private void configureRememberWithoutBlockingSignIn(UserProfile profile, boolean remember) {
        try {
            auth.configureRememberedSession(profile, remember);
        } catch (Exception ignored) {
            // Authentication remains valid. A failed optional token must never lock out the owner.
        }
    }

    private static void report(Consumer<BootProgress> consumer, String title, String detail,
                               double progress, int step) {
        if (consumer != null) Platform.runLater(() -> consumer.accept(new BootProgress(title, detail, progress, step)));
    }

    private <T> void runTask(Callable<T> work, Consumer<T> success, Consumer<Throwable> error) {
        Objects.requireNonNull(work);
        Task<T> task = new Task<>() {
            @Override protected T call() throws Exception { return work.call(); }
        };
        task.setOnSucceeded(event -> success.accept(task.getValue()));
        task.setOnFailed(event -> error.accept(task.getException()));
        Thread.ofVirtual().name("finora-worker").start(task);
    }
}
