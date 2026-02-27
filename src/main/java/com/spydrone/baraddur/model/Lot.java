package com.spydrone.baraddur.model;

public class Lot {

    private final String id;
    private final String product;
    private final int wafers;
    private String stage;
    private final String priority;
    private final String status;
    private final String operator;
    private final String target;
    private final String orderId;

    public Lot(String id, String product, int wafers, String stage, String priority,
               String status, String operator, String target, String orderId) {
        this.id = id;
        this.product = product;
        this.wafers = wafers;
        this.stage = stage;
        this.priority = priority;
        this.status = status;
        this.operator = operator;
        this.target = target;
        this.orderId = orderId;
    }

    public String getId()       { return id; }
    public String getProduct()  { return product; }
    public int    getWafers()   { return wafers; }
    public String getStage()    { return stage; }
    public String getPriority() { return priority; }
    public String getStatus()   { return status; }
    public String getOperator() { return operator; }
    public String getTarget()   { return target; }
    public String getOrderId()  { return orderId; }

    public void moveToStage(String newStage) {
        this.stage = newStage;
    }
}
