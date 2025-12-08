-- 1. Items table
CREATE DATABASE rfid_warehouse;
USE rfid_warehouse;

CREATE TABLE items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4;

-- 2. Locations table
CREATE TABLE locations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    location_code VARCHAR(50) UNIQUE NOT NULL,
    zone VARCHAR(50),
    rack VARCHAR(50),
    bin VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4;

-- 3. RFID tags table
CREATE TABLE rfid_tags (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tag_uid VARCHAR(100) UNIQUE NOT NULL,
    item_code VARCHAR(50),
    batch_no VARCHAR(50),
    expiry_date DATE,
    current_location_id INT,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_code) REFERENCES items(item_code) ON DELETE CASCADE,
    FOREIGN KEY (current_location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB CHARSET=utf8mb4;

-- 4. Indexes
-- Items indexes
CREATE INDEX idx_item_code ON items(item_code);
CREATE INDEX idx_created_at ON items(created_at);

-- RFID tags indexes
CREATE INDEX idx_tag_uid ON rfid_tags(tag_uid);
CREATE INDEX idx_current_location_id ON rfid_tags(current_location_id);
CREATE INDEX idx_item_code_rfid ON rfid_tags(item_code);
CREATE INDEX idx_batch_no ON rfid_tags(batch_no);
CREATE INDEX idx_expiry_date ON rfid_tags(expiry_date);

-- 5. Tag movements table (if needed)
CREATE TABLE tag_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tag_uid VARCHAR(100) NOT NULL,
    from_location_id INT,
    to_location_id INT,
    moved_by VARCHAR(100),
    movement_type ENUM('register', 'move', 'receive', 'adjustment'),
    movement_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (tag_uid) REFERENCES rfid_tags(tag_uid) ON DELETE CASCADE,
    FOREIGN KEY (from_location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (to_location_id) REFERENCES locations(id) ON DELETE SET NULL
) ENGINE=InnoDB CHARSET=utf8mb4;

-- Tag movements indexes
CREATE INDEX idx_movement_time ON tag_movements(movement_time);
CREATE INDEX idx_tag_uid_movement ON tag_movements(tag_uid);
CREATE INDEX idx_movement_type ON tag_movements(movement_type);

-- 6. INSERT SAMPLE LOCATIONS
INSERT INTO locations (location_code, zone, rack, bin) VALUES
('REC-01', 'Receiving', 'Rack0', 'Bin0', 'receiving'),
('STORAGE-A1', 'Zone-A', 'Rack1', 'Bin1', 'storage'),
('STORAGE-A2', 'Zone-A', 'Rack1', 'Bin2', 'storage'),
('STORAGE-B1', 'Zone-B', 'Rack2', 'Bin1', 'storage');

-- 7. CHECK EVERYTHING WORKED
SELECT 'Database created successfully!' as message;