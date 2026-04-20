-- Smart PG Management System - Seed Data
-- Insert sample data for testing

-- Insert Owner Users (8 owners, one per PG)
INSERT INTO users (user_id, name, email, password_hash, role, phone, place, is_active) VALUES
(5, 'Vikram Singh', 'vikram.singh@pgowner.com', 'Vikram Singh', 'owner', '9876543214', 'Chennai', true),
(1000003, 'Sunshine Owner', 'owner.sunshine@pgowner.com', 'password123', 'owner', '9999999993', 'Hyderabad', true),
(1000004, 'Green Valley Owner', 'owner.greenvalley@pgowner.com', 'password123', 'owner', '9999999994', 'Bangalore', true),
(1000005, 'City Comfort Owner', 'owner.citycomfort@pgowner.com', 'password123', 'owner', '9999999995', 'Mumbai', true),
(1000006, 'Elite Living Owner', 'owner.eliteliving@pgowner.com', 'password123', 'owner', '9999999996', 'Delhi', true),
(1000007, 'Metro Stay Owner', 'owner.metrostay@pgowner.com', 'password123', 'owner', '9999999997', 'Pune', true),
(1000008, 'Capital Exec Owner', 'owner.capital@pgowner.com', 'password123', 'owner', '9999999998', 'Gurgaon', true),
(1000009, 'Student Nest Owner', 'owner.studentnest@pgowner.com', 'password123', 'owner', '9999999999', 'Hyderabad', true);

-- Insert Service Provider User
INSERT INTO users (user_id, name, email, password_hash, role, phone, place, is_active) VALUES
(32, 'Shyam', 'services.all@email.com', '$2a$10$YourHashHere', 'service_provider', '9900110002', 'Bangalore', true);

-- Insert Tenant Users (user_id 6-30)
INSERT INTO users (user_id, name, email, password_hash, role, phone, place, is_active) VALUES
(6, 'Rahul Verma', 'rahul.verma@email.com', '$2a$10$Hash', 'tenant', '9988776601', 'Bangalore', true),
(7, 'Sneha Iyer', 'sneha.iyer@email.com', '$2a$10$Hash', 'tenant', '9988776602', 'Chennai', true),
(8, 'Arjun Nair', 'arjun.nair@email.com', '$2a$10$Hash', 'tenant', '9988776603', 'Kerala', true),
(9, 'Kavitha Menon', 'kavitha.menon@email.com', '$2a$10$Hash', 'tenant', '9988776604', 'Bangalore', true),
(10, 'Deepak Joshi', 'deepak.joshi@email.com', '$2a$10$Hash', 'tenant', '9988776605', 'Pune', true),
(11, 'Ananya Das', 'ananya.das@email.com', '$2a$10$Hash', 'tenant', '9988776606', 'Kolkata', true),
(12, 'Rohit Saxena', 'rohit.saxena@email.com', '$2a$10$Hash', 'tenant', '9988776607', 'Delhi', true),
(13, 'Meera Krishnan', 'meera.krishnan@email.com', '$2a$10$Hash', 'tenant', '9988776608', 'Mumbai', true),
(14, 'Sanjay Gupta', 'sanjay.gupta@email.com', '$2a$10$Hash', 'tenant', '9988776609', 'Bangalore', true),
(15, 'Pooja Agarwal', 'pooja.agarwal@email.com', '$2a$10$Hash', 'tenant', '9988776610', 'Hyderabad', true),
(16, 'Karthik Raman', 'karthik.raman@email.com', '$2a$10$Hash', 'tenant', '9988776611', 'Chennai', true),
(17, 'Divya Pillai', 'divya.pillai@email.com', '$2a$10$Hash', 'tenant', '9988776612', 'Kerala', true),
(18, 'Nikhil Bhatt', 'nikhil.bhatt@email.com', '$2a$10$Hash', 'tenant', '9988776613', 'Ahmedabad', true),
(19, 'Swati Mishra', 'swati.mishra@email.com', '$2a$10$Hash', 'tenant', '9988776614', 'Lucknow', true),
(20, 'Arun Prakash', 'arun.prakash@email.com', '$2a$10$Hash', 'tenant', '9988776615', 'Bangalore', true),
(21, 'Priyanka Shah', 'priyanka.shah@email.com', '$2a$10$Hash', 'tenant', '9988776616', 'Mumbai', true),
(22, 'Varun Malhotra', 'varun.malhotra@email.com', '$2a$10$Hash', 'tenant', '9988776617', 'Delhi', true),
(23, 'Lakshmi Rao', 'lakshmi.rao@email.com', '$2a$10$Hash', 'tenant', '9988776618', 'Hyderabad', true),
(24, 'Suresh Kumar', 'suhresh.kumar@email.com', '$2a$10$Hash', 'tenant', '9988776619', 'Chennai', true),
(25, 'Anjali Chopra', 'anjali.chopra@email.com', '$2a$10$Hash', 'tenant', '9988776620', 'Bangalore', true),
(26, 'Manish Tiwari', 'manish.tiwari@email.com', '$2a$10$Hash', 'tenant', '9988776621', 'Pune', true),
(27, 'Rekha Nayak', 'rekha.nayak@email.com', '$2a$10$Hash', 'tenant', '9988776622', 'Mumbai', true),
(28, 'Ajay Sinha', 'ajay.sinha@email.com', '$2a$10$Hash', 'tenant', '9988776623', 'Kolkata', true),
(29, 'Neha Kapoor', 'neha.kapoor@email.com', '$2a$10$Hash', 'tenant', '9988776624', 'Delhi', true),
(30, 'Vijay Krishna', 'vijay.krishna@email.com', '$2a$10$Hash', 'tenant', '9988776625', 'Hyderabad', true);

-- Insert PG Properties
INSERT INTO pg (pg_name, location, total_rooms, available_rooms, rent, rating, owner_id, amenities, room_type, ac_type) VALUES
('Sunshine PG', 'Madhapur, Hyderabad', 20, 5, 8000, 4.5, 1, ARRAY['WiFi', 'AC', 'Laundry', 'Parking', 'Gym'], 'Both', 'Both'),
('Green Valley PG', 'Koramangala, Bangalore', 15, 3, 10000, 4.2, 2, ARRAY['WiFi', 'AC', 'Food', 'Security'], 'Single', 'AC'),
('City Comfort PG', 'Andheri, Mumbai', 25, 8, 12000, 4.0, 3, ARRAY['WiFi', 'Laundry', 'Food', 'CCTV'], 'Shared', 'Both'),
('Royal Stay PG', 'Hinjewadi, Pune', 18, 6, 7500, 4.3, 4, ARRAY['WiFi', 'Parking', 'Food', 'Power Backup'], 'Both', 'AC'),
('Metro Living PG', 'Velachery, Chennai', 22, 4, 9000, 4.1, 5, ARRAY['WiFi', 'AC', 'Gym', 'Security'], 'Shared', 'AC'),
('Capital Homes PG', 'Gurgaon, Delhi', 30, 10, 11000, 4.4, 6, ARRAY['WiFi', 'AC', 'Food', 'Laundry', 'Parking'], 'Single', 'AC'),
('Budget Stay PG', 'Ameerpet, Hyderabad', 30, 12, 4500, 3.8, 1, ARRAY['WiFi', 'Food'], 'Shared', 'Non-AC'),
('Elite Living PG', 'Whitefield, Bangalore', 10, 2, 14000, 4.8, 2, ARRAY['WiFi', 'Food', 'Laundry', 'Gym', 'Swimming Pool'], 'Single', 'AC'),
('Student Nest PG', 'Kothrud, Pune', 35, 15, 5000, 4.0, 3, ARRAY['WiFi', 'Food', 'Study Room'], 'Shared', 'Non-AC'),
('Urban Nest PG', 'Banjara Hills, Hyderabad', 12, 3, 9500, 4.6, 4, ARRAY['WiFi', 'Food', 'Parking', 'CCTV'], 'Shared', 'Non-AC');

-- Insert Tenants (linking users to PGs)
INSERT INTO tenants (user_id, pg_id, room_number, room_type, payment_status, sleep_preference) VALUES
(8, 1, 101, 'Shared', 'Paid', 'Early Sleeper'),
(9, 1, 102, 'Shared', 'Unpaid', 'Night Owl'),
(10, 1, 101, 'Shared', 'Paid', 'Early Sleeper'),
(11, 2, 201, 'Single', 'Paid', 'Night Owl'),
(12, 3, 301, 'Shared', 'Pending', 'Early Sleeper');

-- Insert Complaints
INSERT INTO complaints (tenant_id, title, description, category, status, worker_name, worker_phone) VALUES
(1, 'AC Not Working', 'The AC in room 101 is making strange noises and not cooling properly', 'Electrical', 'Pending', NULL, NULL),
(2, 'Water Leakage', 'There is water leakage from the bathroom ceiling', 'Plumbing', 'In Progress', 'Ramesh Kumar', '9988776655'),
(3, 'Room Cleaning', 'Room needs deep cleaning, dust everywhere', 'Cleaning', 'Completed', 'Suresh', '9977665544'),
(1, 'Food Quality', 'The food quality has declined in recent days', 'Food', 'Approved', NULL, NULL),
(4, 'WiFi Issues', 'WiFi connection is very slow in the evening hours', 'Other', 'Pending', NULL, NULL);

-- Insert Payments
INSERT INTO payments (tenant_id, amount, type, room_type, status) VALUES
(1, 8000, 'Room', 'Shared', 'Completed'),
(1, 3000, 'Food', NULL, 'Completed'),
(2, 8000, 'Room', 'Shared', 'Pending'),
(3, 8000, 'Room', 'Shared', 'Completed'),
(4, 10000, 'Room', 'Single', 'Completed'),
(5, 12000, 'Room', 'Shared', 'Pending');

-- Insert Food Menu for PG 1 (Sunshine PG)
INSERT INTO food_menu (pg_id, day, breakfast, lunch, dinner) VALUES
(1, 'Monday', 'Idli, Sambar, Chutney', 'Rice, Dal, Sabzi, Roti', 'Chapati, Paneer Curry, Rice'),
(1, 'Tuesday', 'Dosa, Chutney, Sambar', 'Rice, Rajma, Salad, Roti', 'Rice, Chicken Curry, Dal'),
(1, 'Wednesday', 'Poha, Tea', 'Rice, Chole, Raita, Roti', 'Biryani, Raita, Salad'),
(1, 'Thursday', 'Upma, Coconut Chutney', 'Rice, Dal Fry, Aloo Gobi', 'Roti, Mixed Veg, Rice'),
(1, 'Friday', 'Paratha, Curd, Pickle', 'Rice, Fish Curry, Salad', 'Fried Rice, Manchurian'),
(1, 'Saturday', 'Puri, Bhaji', 'Rice, Sambar, Papad, Sabzi', 'Dosa, Sambar, Chutney'),
(1, 'Sunday', 'Chole Bhature', 'Biryani, Raita, Salad', 'Pizza, Pasta, Garlic Bread');

-- Insert Food Menu for PG 2 (Green Valley PG)
INSERT INTO food_menu (pg_id, day, breakfast, lunch, dinner) VALUES
(2, 'Monday', 'Bread, Jam, Eggs', 'Rice, Sambar, Rasam', 'Chapati, Dal, Sabzi'),
(2, 'Tuesday', 'Oats, Fruits', 'Rice, Chicken Curry, Salad', 'Roti, Paneer Tikka'),
(2, 'Wednesday', 'Sandwich, Juice', 'Pulao, Raita, Papad', 'Noodles, Soup'),
(2, 'Thursday', 'Idli, Vada, Sambar', 'Rice, Fish Fry, Dal', 'Chapati, Egg Curry'),
(2, 'Friday', 'Cornflakes, Milk', 'Biryani, Mirchi Ka Salan', 'Pizza, Salad'),
(2, 'Saturday', 'Uttapam, Chutney', 'Rice, Kadhi, Sabzi', 'Paratha, Curd'),
(2, 'Sunday', 'Pancakes, Honey', 'Special Thali', 'Burger, Fries');

-- Insert Food Ratings
INSERT INTO food_ratings (tenant_id, pg_id, rating, comment) VALUES
(1, 1, 4, 'Good food quality, could improve variety'),
(2, 1, 5, 'Excellent food, loved the biryani'),
(3, 1, 3, 'Average taste, needs more spices'),
(4, 2, 4, 'Nice breakfast options'),
(5, 3, 4, 'Good home-style cooking');

-- Insert Service Workers (30 workers, 5 per category)

-- Electricity Workers (5)
INSERT INTO service_workers (name, phone, category, status) VALUES
('Kiran Kumar', '9876543201', 'Electricity', 'Available'),
('Suresh Rao', '9876543202', 'Electricity', 'Busy'),
('Anil Kumar', '9876543207', 'Electricity', 'Available'),
('Vijay Singh', '9876543208', 'Electricity', 'On Leave'),
('Ramesh Singh', '9876543203', 'Electricity', 'Available');

-- Plumbing Workers (5)
INSERT INTO service_workers (name, phone, category, status) VALUES
('Raju Plumber', '9876543204', 'Plumbing', 'Available'),
('Sandeep Gupta', '9876543209', 'Plumbing', 'Busy'),
('Mohit Sharma', '9876543212', 'Plumbing', 'Available'),
('Vikas Verma', '9876543213', 'Plumbing', 'Available'),
('Sunil Das', '9876543214', 'Plumbing', 'On Leave');

-- AC Technician Workers (5)
INSERT INTO service_workers (name, phone, category, status) VALUES
('Mahesh AC', '9876543205', 'AC Technician', 'Busy'),
('Rahul AC', '9876543215', 'AC Technician', 'Available'),
('Pankaj AC', '9876543216', 'AC Technician', 'Available'),
('Imran Khan', '9876543217', 'AC Technician', 'Available'),
('Deepak AC', '9876543218', 'AC Technician', 'Available');

-- Carpenter Workers (5)
INSERT INTO service_workers (name, phone, category, status) VALUES
('Vikram Carpenter', '9876543206', 'Carpenter', 'Available'),
('Sohan Carpenter', '9876543219', 'Carpenter', 'Available'),
('Bablu Carpenter', '9876543220', 'Carpenter', 'Available'),
('Sanjay Carpenter', '9876543221', 'Carpenter', 'Available'),
('Amit Carpenter', '9876543222', 'Carpenter', 'Available');

-- Internet Workers (5)
INSERT INTO service_workers (name, phone, category, status) VALUES
('Arjun Reddy', '9876543210', 'Internet', 'Available'),
('Varun Internet', '9876543223', 'Internet', 'Available'),
('Sandeep Net', '9876543224', 'Internet', 'Available'),
('Kunal Tech', '9876543225', 'Internet', 'Available'),
('Rishi Tech', '9876543226', 'Internet', 'Available');

-- Cleaning / Other Workers (5)
INSERT INTO service_workers (name, phone, category, status) VALUES
('Sunita Devi', '9876543211', 'Cleaning', 'Available'),
('Geeta Bai', '9876543227', 'Cleaning', 'Available'),
('Rajesh Cleaning', '9876543228', 'Cleaning', 'Available'),
('Rekha Rani', '9876543229', 'Cleaning', 'Available'),
('Kamlesh Cleaning', '9876543230', 'Cleaning', 'Available');

-- Food Workers (5)
INSERT INTO service_workers (name, phone, category, status) VALUES
('Ramesh Cook', '9876543231', 'Food', 'Available'),
('Suresh Chef', '9876543232', 'Food', 'Available'),
('Anita Kitchen', '9876543233', 'Food', 'Busy'),
('Bhavna Cook', '9876543234', 'Food', 'Available'),
('Dinesh Chef', '9876543235', 'Food', 'Available');
