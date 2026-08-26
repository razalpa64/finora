package com.finora.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.*;

public final class Ui {
    private Ui(){}
    public static Label label(String text,String...classes){Label l=new Label(text);l.getStyleClass().addAll(classes);return l;}
    public static VBox card(Node...children){VBox box=new VBox(14,children);box.getStyleClass().add("card");return box;}
    public static HBox row(Node...children){HBox box=new HBox(12,children);box.setAlignment(Pos.CENTER_LEFT);return box;}
    public static Button button(String text,String style){Button b=new Button(text);b.getStyleClass().add(style);return b;}
    public static Button iconButton(String icon,String accessible){Button b=new Button();b.setGraphic(Icons.create(icon,18));b.getStyleClass().add("icon-button");b.setAccessibleText(accessible);return b;}
    public static VBox sectionTitle(String eyebrow,String title,String body){VBox box=new VBox(4,label(eyebrow,"eyebrow"),label(title,"page-title"));if(body!=null)box.getChildren().add(label(body,"page-subtitle"));return box;}
    public static Region spacer(){Region r=new Region();HBox.setHgrow(r,Priority.ALWAYS);return r;}
    public static StackPane severityDot(String severity){StackPane d=new StackPane();d.getStyleClass().addAll("severity-dot","severity-"+severity.toLowerCase());d.setMinSize(8,8);d.setMaxSize(8,8);return d;}
    public static ScrollPane scroll(Node content){ScrollPane s=new ScrollPane(content);s.setFitToWidth(true);s.getStyleClass().add("page-scroll");return s;}
    public static void gridColumns(GridPane grid,double...percents){for(double p:percents){ColumnConstraints c=new ColumnConstraints();c.setPercentWidth(p);c.setHgrow(Priority.ALWAYS);grid.getColumnConstraints().add(c);}}
    public static void setPadding(Region region,double top,double right,double bottom,double left){region.setPadding(new Insets(top,right,bottom,left));}
}
