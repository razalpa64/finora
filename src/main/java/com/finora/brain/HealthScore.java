package com.finora.brain;
import java.util.List;
import java.util.Map;
public record HealthScore(int overall, Map<String,Integer> factors, List<String> reasons, String label){}
