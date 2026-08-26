package com.finora.ui;
import com.finora.controller.AppController;
import javafx.stage.Window;
import java.util.function.Consumer;
import java.util.function.Supplier;
public record PageContext(AppController controller,Runnable refresh,Consumer<String> toast,Consumer<Throwable> error,Supplier<Window> owner){}
