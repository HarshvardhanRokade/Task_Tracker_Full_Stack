package com.harsh.task.exception;

public class PriceChangedException extends RuntimeException {
    private final int actualCost;
    public PriceChangedException(String message, int actualCost) {
        super(message);
        this.actualCost = actualCost;
    }
    public int getActualCost() { return actualCost; }
}