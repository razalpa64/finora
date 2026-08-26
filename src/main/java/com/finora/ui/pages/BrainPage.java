package com.finora.ui.pages;

import com.finora.ai.*;
import com.finora.brain.FinoraBrain;
import com.finora.ui.*;
import javafx.application.Platform;
import javafx.collections.FXCollections;
import javafx.geometry.*;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.input.*;
import javafx.scene.layout.*;
import javafx.stage.Modality;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;

/** Responsive private-financial-intelligence workspace. */
public final class BrainPage {
    private BrainPage(){}
    public static Node build(FinoraBrain.BrainState state,PageContext ctx){return build(state,ctx,null);}
    public static Node build(FinoraBrain.BrainState state,PageContext ctx,String initialQuestion){
        VBox page=new VBox(16);page.getStyleClass().add("brain-page-content");
        Label privacy=Ui.label("●  PRIVATE · ON-DEVICE","offline-chip");
        Button briefing=Ui.button("Daily briefing","secondary-button"),memory=Ui.button("Memory","secondary-button"),settings=Ui.button("Model & privacy","secondary-button");
        HBox header=Ui.row(Ui.sectionTitle("UNDERSTAND → RETRIEVE → CALCULATE → REASON → EXPLAIN → REMEMBER","FINORA BRAIN","Verified financial intelligence from your records — never guessed."),Ui.spacer(),privacy,briefing,memory,settings);

        AtomicReference<Long> activeConversation=new AtomicReference<>();AtomicReference<String> lastQuestion=new AtomicReference<>();
        VBox messages=new VBox(14);messages.getStyleClass().add("conversation");messages.getChildren().add(welcome());
        ScrollPane chat=new ScrollPane(messages);chat.setFitToWidth(true);chat.getStyleClass().add("chat-scroll");VBox.setVgrow(chat,Priority.ALWAYS);
        Label status=Ui.label("Ready · deterministic finance engine available","brain-status");ProgressIndicator busy=new ProgressIndicator();busy.setMaxSize(16,16);busy.setVisible(false);busy.setManaged(false);

        TextArea input=new TextArea();input.setPromptText("Ask about balances, spending, debt, bills, goals, affordability or forecasts…");input.setPrefRowCount(2);input.setWrapText(true);input.getStyleClass().add("brain-input");
        Button send=Ui.button("Send","brain-send"),stop=Ui.button("Stop","secondary-button");send.setGraphic(Icons.create("arrow",16));stop.setVisible(false);stop.setManaged(false);
        HBox composer=Ui.row(input,busy,stop,send);HBox.setHgrow(input,Priority.ALWAYS);composer.getStyleClass().add("brain-composer");

        ListView<ConversationService.Conversation> conversationList=new ListView<>();conversationList.getStyleClass().add("brain-conversation-list");VBox.setVgrow(conversationList,Priority.ALWAYS);
        conversationList.setCellFactory(list->new ListCell<>(){@Override protected void updateItem(ConversationService.Conversation value,boolean empty){super.updateItem(value,empty);if(empty||value==null){setText(null);setGraphic(null);}else{Label title=Ui.label(value.title(),"conversation-title");title.setWrapText(true);Label date=Ui.label(value.updatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate().toString(),"micro-copy");setGraphic(new VBox(3,title,date));}}});
        TextField search=new TextField();search.setPromptText("Search chats");Button searchButton=Ui.iconButton("search","Search conversations"),newChat=Ui.button("+ New","primary-button"),deleteChat=Ui.iconButton("trash","Delete selected conversation");
        HBox searchRow=Ui.row(search,searchButton);HBox.setHgrow(search,Priority.ALWAYS);
        VBox rail=new VBox(10,Ui.row(newChat,Ui.spacer(),deleteChat),searchRow,conversationList,Ui.label("History is capped locally. Delete any chat at any time.","micro-copy"));rail.getStyleClass().add("brain-rail");rail.setPrefWidth(245);rail.setMinWidth(210);

        String[] suggestions={"Daily briefing from my current records","Where did I spend most this month?","Can I afford ₹30,000?","Which debt should I pay first?","What bills are due?","Show my net worth","Build a monthly plan","What do you remember?"};
        HBox quick=new HBox(8);for(String value:suggestions){Button chip=Ui.button(value,"prompt-chip");chip.setOnAction(e->{input.setText(value);send.fire();});quick.getChildren().add(chip);}ScrollPane quickScroll=new ScrollPane(quick);quickScroll.setFitToHeight(true);quickScroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.AS_NEEDED);quickScroll.setVbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);quickScroll.getStyleClass().add("prompt-scroll");
        VBox chatArea=new VBox(10,Ui.row(busy,status),quickScroll,chat,composer,Ui.label("Database truth overrides memory and conversation. Scenarios never alter records unless you explicitly apply them.","assumption-label"));VBox.setVgrow(chat,Priority.ALWAYS);
        HBox workspace=new HBox(14,rail,chatArea);HBox.setHgrow(chatArea,Priority.ALWAYS);VBox.setVgrow(workspace,Priority.ALWAYS);workspace.getStyleClass().add("brain-workspace");

        Runnable resetComposer=()->{send.setDisable(false);busy.setVisible(false);busy.setManaged(false);stop.setVisible(false);stop.setManaged(false);};
        Runnable refreshConversations=()->ctx.controller().listAIConversations(search.getText(),items->conversationList.setItems(FXCollections.observableArrayList(items)),ctx.error());
        Runnable submit=()->{String question=input.getText().trim();if(question.isBlank()||send.isDisable())return;lastQuestion.set(question);messages.getChildren().add(userBubble(question));input.clear();send.setDisable(true);busy.setVisible(true);busy.setManaged(true);stop.setVisible(true);stop.setManaged(true);status.setText("Understanding your question…");
            ctx.controller().askAI(activeConversation.get(),question,stage->status.setText(stageLabel(stage)),answer->{activeConversation.set(answer.conversationId());messages.getChildren().add(answerCard(answer.text(),answer.intent().name(),answer.tools(),answer.memoriesUsed(),answer.verified(),answer.modelInfo(),()->{input.setText(lastQuestion.get());send.fire();}));resetComposer.run();status.setText(answer.verified()?"Verified · "+answer.modelInfo().provider()+" · private":"Review required");refreshConversations.run();Platform.runLater(()->chat.setVvalue(1));},error->{resetComposer.run();status.setText("Could not complete the request");ctx.error().accept(error);});};
        send.setOnAction(e->submit.run());briefing.setOnAction(e->{input.setText("Daily briefing from my current records");send.fire();});input.addEventFilter(KeyEvent.KEY_PRESSED,e->{if(e.getCode()==KeyCode.ENTER&&!e.isShiftDown()){e.consume();submit.run();}});stop.setOnAction(e->{ctx.controller().stopAI();resetComposer.run();status.setText("Stopped by you");});

        Runnable newConversation=()->{activeConversation.set(null);lastQuestion.set(null);conversationList.getSelectionModel().clearSelection();messages.getChildren().setAll(welcome());input.requestFocus();status.setText("New private conversation");};newChat.setOnAction(e->newConversation.run());
        conversationList.getSelectionModel().selectedItemProperty().addListener((obs,old,value)->{if(value==null)return;activeConversation.set(value.id());ctx.controller().loadAIConversation(value.id(),history->{messages.getChildren().clear();for(var item:history)messages.getChildren().add("USER".equalsIgnoreCase(item.role())?userBubble(item.content()):answerCard(item.content(),item.intent(),List.of(),0,item.verified(),ModelInfo.deterministic(),()->{}));if(history.isEmpty())messages.getChildren().add(welcome());Platform.runLater(()->chat.setVvalue(1));},ctx.error());});
        searchButton.setOnAction(e->refreshConversations.run());search.setOnAction(e->refreshConversations.run());deleteChat.setOnAction(e->{var selected=conversationList.getSelectionModel().getSelectedItem();if(selected==null)return;ctx.controller().deleteAIConversation(selected.id(),()->{newConversation.run();refreshConversations.run();ctx.toast().accept("Conversation deleted");},ctx.error());});
        memory.setOnAction(e->showMemory(ctx));settings.setOnAction(e->showSettings(ctx,privacy,briefing));

        workspace.widthProperty().addListener((obs,old,width)->{boolean show=width.doubleValue()>=850;rail.setManaged(show);rail.setVisible(show);});
        page.getChildren().addAll(header,workspace);refreshConversations.run();ctx.controller().loadAISettings(value->{briefing.setVisible(value.dailyBriefing());briefing.setManaged(value.dailyBriefing());},ctx.error());
        if(initialQuestion!=null&&!initialQuestion.isBlank())Platform.runLater(()->{input.setText(initialQuestion);send.fire();});
        return page;
    }

    private static VBox welcome(){Label title=Ui.label("Ask with confidence. I calculate before I explain.","brain-answer-headline");title.setWrapText(true);Label body=Ui.label("I can read your current FINORA records through restricted tools, run BigDecimal calculations, explain assumptions, and tell you exactly what data is missing. No financial data leaves this computer unless you explicitly configure a future cloud provider.","brain-answer-summary");body.setWrapText(true);VBox card=new VBox(10,Ui.row(Icons.create("brain",19),Ui.label("PRIVATE FINANCIAL INTELLIGENCE","eyebrow")),title,body);card.getStyleClass().addAll("answer-card","brain-welcome");return card;}
    private static HBox userBubble(String text){Label label=Ui.label(text,"user-bubble-text");label.setWrapText(true);StackPane bubble=new StackPane(label);bubble.getStyleClass().add("user-bubble");HBox row=new HBox(bubble);row.setAlignment(Pos.CENTER_RIGHT);return row;}
    private static VBox answerCard(String text,String intent,List<String> tools,int memories,boolean verified,ModelInfo model,Runnable regenerate){
        VBox rendered=render(text);Button copy=Ui.iconButton("copy","Copy answer"),again=Ui.iconButton("refresh","Regenerate answer");copy.setOnAction(e->{ClipboardContent content=new ClipboardContent();content.putString(text);Clipboard.getSystemClipboard().setContent(content);});again.setOnAction(e->regenerate.run());
        String badge=verified?"✓ VERIFIED":"REVIEW";HBox meta=Ui.row(Icons.create("brain",18),Ui.label(intent==null?"FINORA BRAIN":intent.replace('_',' '),"eyebrow"),Ui.spacer(),Ui.label(badge,"verified-chip"),copy,again);
        HBox trace=new HBox(7);trace.getChildren().add(Ui.label("Tools:","micro-copy"));for(String tool:tools)trace.getChildren().add(Ui.label(tool,"tool-chip"));if(memories>0)trace.getChildren().add(Ui.label(memories+" memories used","memory-chip"));if(model!=null)trace.getChildren().add(Ui.label(model.provider()+" · "+(model.local()?"local":"external"),"tool-chip"));
        VBox card=new VBox(12,meta,rendered,trace);card.getStyleClass().add("answer-card");return card;
    }
    private static VBox render(String markdown){VBox box=new VBox(7);for(String raw:markdown.split("\\R",-1)){String line=raw.trim();if(line.isBlank()){Region gap=new Region();gap.setMinHeight(3);box.getChildren().add(gap);continue;}String clean=line.replace("**","").replace("_","");Label label;if(clean.startsWith("### ")){label=Ui.label(clean.substring(4),"brain-section-title");}else if(clean.startsWith("## ")){label=Ui.label(clean.substring(3),"brain-answer-headline");}else if(clean.startsWith("- ")){label=Ui.label("•  "+clean.substring(2),"brain-line");}else label=Ui.label(clean,"brain-answer-summary");label.setWrapText(true);box.getChildren().add(label);}return box;}
    private static String stageLabel(FinoraAIEngine.Stage stage){return switch(stage){case UNDERSTANDING->"Understanding intent…";case RETRIEVING->"Retrieving records and relevant memory…";case CALCULATING->"Running verified financial tools…";case REASONING->"Checking trade-offs…";case EXPLAINING->"Preparing a clear explanation…";case REMEMBERING->"Saving permitted conversation context…";case COMPLETE->"Complete";};}

    private static void showMemory(PageContext ctx){Dialog<Void> dialog=new Dialog<>();dialog.setTitle("FINORA BRAIN Memory");dialog.initModality(Modality.WINDOW_MODAL);if(ctx.owner().get()!=null)dialog.initOwner(ctx.owner().get());dialog.getDialogPane().getButtonTypes().add(ButtonType.CLOSE);VBox content=new VBox(12,Ui.label("YOU CONTROL MEMORY","eyebrow"),Ui.label("Only explicit user-stated preferences are stored here. Current financial records always win.","page-subtitle"));ScrollPane scroll=new ScrollPane(content);scroll.setFitToWidth(true);scroll.setPrefSize(560,400);dialog.getDialogPane().setContent(scroll);
        Runnable[] reload=new Runnable[1];reload[0]=()->ctx.controller().listAIMemory(items->{content.getChildren().removeIf(node->node.getProperties().containsKey("memory-row"));if(items.isEmpty()){Label empty=Ui.label("No saved memories.","empty-body");empty.getProperties().put("memory-row",true);content.getChildren().add(empty);}for(var item:items){TextField value=new TextField(item.value());Button save=Ui.button("Save","secondary-button"),forget=Ui.button("Forget","danger-button");HBox actions=Ui.row(save,forget);VBox row=new VBox(6,Ui.label(item.type()+" · "+item.key(),"field-label"),value,actions);row.getStyleClass().add("memory-row");row.getProperties().put("memory-row",true);save.setOnAction(e->ctx.controller().updateAIMemory(item.id(),value.getText(),()->ctx.toast().accept("Memory updated"),ctx.error()));forget.setOnAction(e->ctx.controller().deleteAIMemory(item.id(),reload[0],ctx.error()));content.getChildren().add(row);}},ctx.error());
        Button clear=Ui.button("Clear all memory","danger-button");clear.setOnAction(e->ctx.controller().clearAIMemory(reload[0],ctx.error()));content.getChildren().add(clear);reload[0].run();dialog.showAndWait();}

    private static void showSettings(PageContext ctx,Label privacy,Button briefingButton){Dialog<Void> dialog=new Dialog<>();dialog.setTitle("Model & privacy");dialog.initModality(Modality.WINDOW_MODAL);if(ctx.owner().get()!=null)dialog.initOwner(ctx.owner().get());dialog.getDialogPane().getButtonTypes().add(ButtonType.CLOSE);
        ChoiceBox<String> provider=new ChoiceBox<>(FXCollections.observableArrayList("DETERMINISTIC","OLLAMA","LLAMA_CPP"));provider.setValue("DETERMINISTIC");TextField endpoint=new TextField(),model=new TextField();endpoint.setPromptText("http://127.0.0.1:11434");model.setPromptText("llama3.2:3b or local model name");CheckBox memory=new CheckBox("Enable structured memory"),briefing=new CheckBox("Enable daily briefing"),cloud=new CheckBox("I explicitly consent to cloud processing (future providers only)");ChoiceBox<String> style=new ChoiceBox<>(FXCollections.observableArrayList("CONCISE","BALANCED","DETAILED"));style.setValue("BALANCED");Button save=Ui.button("Save private AI settings","primary-button");Label note=Ui.label("Deterministic tools always remain available. Ollama and llama.cpp endpoints should run locally. FINORA sends nothing to a cloud provider in this release.","assumption-label");note.setWrapText(true);
        GridPane grid=new GridPane();grid.setHgap(12);grid.setVgap(10);grid.addRow(0,Ui.label("Provider","field-label"),provider);grid.addRow(1,Ui.label("Local endpoint","field-label"),endpoint);grid.addRow(2,Ui.label("Model","field-label"),model);grid.addRow(3,Ui.label("Response style","field-label"),style);
        VBox box=new VBox(14,Ui.label("LOCAL MODEL CONTROL","eyebrow"),grid,memory,briefing,cloud,note,save);box.setPrefWidth(560);dialog.getDialogPane().setContent(box);
        ctx.controller().loadAISettings(value->{provider.setValue(value.providerType());endpoint.setText(value.providerEndpoint());model.setText(value.modelName());style.setValue(value.responseStyle());memory.setSelected(value.memoryEnabled());briefing.setSelected(value.dailyBriefing());cloud.setSelected(value.cloudConsent());},ctx.error());
        save.setOnAction(e->{AISettingsService.Settings value=new AISettingsService.Settings(memory.isSelected(),briefing.isSelected(),provider.getValue(),endpoint.getText(),model.getText(),style.getValue(),cloud.isSelected());ctx.controller().saveAISettings(value,()->{privacy.setText("●  PRIVATE · "+("DETERMINISTIC".equals(provider.getValue())?"ON-DEVICE":"LOCAL MODEL"));briefingButton.setVisible(briefing.isSelected());briefingButton.setManaged(briefing.isSelected());ctx.toast().accept("AI privacy settings saved");dialog.close();},ctx.error());});dialog.showAndWait();}
}
