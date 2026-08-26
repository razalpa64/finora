package com.finora.brain;
import java.util.List;
public record BrainResponse(String eyebrow,String headline,String summary,List<String> calculation,
                            List<String> recommendations,List<String> assumptions,Recommendation.Severity severity){}
