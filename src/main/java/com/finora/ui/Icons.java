package com.finora.ui;

import javafx.scene.Node;
import javafx.scene.layout.StackPane;
import javafx.scene.shape.SVGPath;

import java.util.Map;

public final class Icons {
    private static final Map<String,String> PATHS=Map.ofEntries(
        Map.entry("overview","M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"),
        Map.entry("transactions","M7 7h11l-4-4 1.4-1.4L21.8 8l-6.4 6.4L14 13l4-4H7V7zm10 10H6l4 4-1.4 1.4L2.2 16l6.4-6.4L10 11l-4 4h11v2z"),
        Map.entry("income","M3 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3V5zm0 3v8h16v-2h-4a2 2 0 0 1 0-4h4V8H3zm12 3a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"),
        Map.entry("plan","M4 4h16v2H4V4zm0 7h10v2H4v-2zm0 7h7v2H4v-2zm13-8 5 5-5 5v-3h-4v-4h4v-3z"),
        Map.entry("debt","M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-1.3c-1.7-.3-3-1.3-3.1-3.1h2c.1 1 1 1.5 2.2 1.5 1.4 0 2-.5 2-1.2 0-.8-.7-1.1-2.4-1.5-2.2-.5-3.5-1.3-3.5-3.1 0-1.6 1.2-2.8 2.8-3.1V4h2v1.2c1.7.3 2.8 1.3 3 3h-2c-.1-.8-.8-1.3-1.9-1.3-1.2 0-1.9.5-1.9 1.2 0 .7.6 1 2.5 1.4 2.2.5 3.5 1.4 3.5 3.2 0 1.7-1.2 2.7-3.2 3V17z"),
        Map.entry("goals","M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 16a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-9a3 3 0 1 0 3 3 3 3 0 0 0-3-3z"),
        Map.entry("calendar","M7 2h2v2h6V2h2v2h3v18H4V4h3V2zm11 8H6v10h12V10z"),
        Map.entry("reports","M4 19h16v2H2V3h2v16zm3-2V9h3v8H7zm5 0V5h3v12h-3zm5 0v-6h3v6h-3z"),
        Map.entry("brain","M12 2a4 4 0 0 0-3.8 2.7A4 4 0 0 0 4 8.7 4 4 0 0 0 3 15a4 4 0 0 0 5.2 3.8A4 4 0 0 0 12 22a4 4 0 0 0 3.8-3.2A4 4 0 0 0 21 15a4 4 0 0 0-1-6.3 4 4 0 0 0-4.2-4A4 4 0 0 0 12 2zm-1 16a2 2 0 0 1-2-2H7a2 2 0 0 1 0-4v-2a2 2 0 0 1 2-2h2v10zm6-6a2 2 0 0 1 0 4h-2a2 2 0 0 1-2 2V8a2 2 0 0 1 2 2h2a2 2 0 0 1 0 2h-2v2h2v-2h-5z"),
        Map.entry("settings","M19.4 13a7.5 7.5 0 0 0 .1-1 7.5 7.5 0 0 0-.1-1l2.1-1.6-2-3.5-2.6 1a8 8 0 0 0-1.7-1L14.8 3h-4l-.4 2.9a8 8 0 0 0-1.7 1L6 5.9l-2 3.5L6.1 11a7.5 7.5 0 0 0-.1 1 7.5 7.5 0 0 0 .1 1L4 14.6l2 3.5 2.7-1a8 8 0 0 0 1.7 1l.4 2.9h4l.4-2.9a8 8 0 0 0 1.7-1l2.6 1 2-3.5L19.4 13zM12.8 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"),
        Map.entry("plus","M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5z"),
        Map.entry("search","M9.5 3a6.5 6.5 0 1 0 4.1 11.5L19.1 20 20.5 18.6 15 13.1A6.5 6.5 0 0 0 9.5 3zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"),
        Map.entry("bell","M12 22a2.2 2.2 0 0 0 2.1-2h-4.2a2.2 2.2 0 0 0 2.1 2zm7-6v-5a7 7 0 0 0-6-6.9V2h-2v2.1A7 7 0 0 0 5 11v5l-2 2h18l-2-2z"),
        Map.entry("expand","M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm14 0h2v6h-6v-2h4v-4z"),
        Map.entry("logout","M10 17v-2h5V9h-5V7l7 5-7 5zM4 3h7v2H6v14h5v2H4V3z"),
        Map.entry("copy","M8 7V3h13v13h-4v5H3V7h5zm2 0h7v7h2V5h-9v2zm5 2H5v10h10V9z"),
        Map.entry("refresh","M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.3L13 11h8V3l-3.3 3.3z"),
        Map.entry("trash","M7 21a2 2 0 0 1-2-2V6h14v13a2 2 0 0 1-2 2H7zM9 2h6l1 2h4v2H4V4h4l1-2zm0 7v8h2V9H9zm4 0v8h2V9h-2z"),
        Map.entry("arrow","M12 4l-1.4 1.4 5.6 5.6H4v2h12.2l-5.6 5.6L12 20l8-8-8-8z")
    );
    private Icons(){}
    public static Node create(String name,double size){SVGPath path=new SVGPath();path.setContent(PATHS.getOrDefault(name,PATHS.get("overview")));path.getStyleClass().add("svg-icon");double scale=size/24.0;path.setScaleX(scale);path.setScaleY(scale);StackPane pane=new StackPane(path);pane.setMinSize(size,size);pane.setPrefSize(size,size);pane.setMaxSize(size,size);return pane;}
}
