CREATE TABLE lots (
    id        VARCHAR(20)  PRIMARY KEY,
    product   VARCHAR(50)  NOT NULL,
    wafers    INT          NOT NULL,
    stage     VARCHAR(20)  NOT NULL,
    priority  VARCHAR(10)  NOT NULL,
    status    VARCHAR(20)  NOT NULL,
    operator  VARCHAR(30)  NOT NULL,
    target    VARCHAR(10)  NOT NULL,
    order_id  VARCHAR(20)
);

CREATE TABLE lot_stage_events (
    event_id   VARCHAR(50)  PRIMARY KEY,
    lot_id     VARCHAR(20)  NOT NULL,
    new_stage  VARCHAR(20)  NOT NULL,
    processed  BOOLEAN      NOT NULL DEFAULT FALSE
);
