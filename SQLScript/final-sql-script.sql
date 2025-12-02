use rm7gitasi7hl7iyi;

-- Table: Books
CREATE TABLE IF NOT EXISTS Books (
    ISBN            Varchar(13)   NOT NULL,
    BookTitle       varchar(20) NOT NULL,
    Course          varchar (20) NOT NULL,
    Major           varchar (20) NOT NULL,
    NumberOfCopies  int NOT NULL,
    ImageURL        varchar (100) null,
    constraint PK_BOOKS primary key(ISBN)
);

Create table if not exists Authors (
	AuthorID		int not null auto_increment,
	ISBN 			varchar (13) not null,
    AuthorFName		varchar (15) not null,
    AuthorLName		varchar (15) not null,
    constraint PK_Authors primary key(AuthorID, ISBN),
    constraint FK_Authors foreign key(ISBN) references Books(ISBN)
);

-- Table: BookCopy
CREATE TABLE IF NOT EXISTS BookCopy (
    CopyID       int   NOT NULL auto_increment,
    ISBN         varchar(13) NOT NULL,
    BookEdition  int NOT NULL,
    YearPrinted  int NOT NULL,
    Price        int NOT NULL,
    Conditions   varchar(10) NOT NULL,
    DateAdded	 date not null,
    Status		 varchar(15) not null,
    constraint PK_COPY primary key(copyID),
    constraint FK_COPY foreign key(ISBN) references Books(ISBN)
);


-- Table: Customers
CREATE TABLE IF NOT EXISTS Customers (
    CustomerID    int NOT NULL auto_increment,
    CustomerName  varchar(30) NOT NULL,
    CPassword     varchar(50) NOT NULL,
    Email         varchar(50) NOT NULL,
    CreatedDate	  date not null,
    constraint PK_CUSTOMERS primary key(CustomerID)
);

-- Table: Staffs
CREATE TABLE IF NOT EXISTS Staffs (
    StaffID    int not null auto_increment,
    StaffName  varchar(30) NOT NULL,
    SPassword  varchar(50) NOT NULL,
    Email      varchar(50) NOT NULL,
    CreatedDate date not null,
    constraint PK_STAFFS primary key(StaffID)
);


-- Table: Transactions
CREATE TABLE IF NOT EXISTS Transactions (
    TransactionID        int NOT NULL auto_increment,
    DateOfTransaction    date NOT NULL,
    CustomerID           int  NOT NULL,
    constraint PK_TRANSACTIONS primary key(TransactionID),
    constraint FK_TRANSACTIONS foreign key(CustomerID) references Customers(CustomerID)
);

-- Table: OrderLineItems
CREATE TABLE IF NOT EXISTS OrderLineItems (
    OrderID        int  NOT NULL auto_increment,
    TransactionID  int NOT NULL,
    CopyID         int UNIQUE NOT NULL,
    OrderStatus    varchar(20) NOT NULL,
    StaffID		   int not null,
    constraint PK_OLI primary key(OrderID),
    constraint FK_OLI1 foreign key(TransactionID) references Transactions(TransactionID),
    constraint FK_OLI2 foreign key(CopyID) references BookCopy(CopyID),
    constraint FK_OLI3 foreign key(StaffID) references Staffs(StaffID)
);

-- inserting data

INSERT INTO Books (ISBN, BookTitle, Course, Major, NumberOfCopies, ImageURL) VALUES
('9780000000001','Calculus I','MATH101','Mathematics',1,NULL),
('9780000000002','Physics I','PHYS101','Physics',1,NULL),
('9780000000003','Biology Basics','BIO101','Biology',1,NULL),
('9780000000004','Chemistry I','CHEM101','Chemistry',1,NULL),
('9780000000005','Programming I','CS101','ComputerSci',1,NULL),
('9780000000006','Data Structures','CS201','ComputerSci',1,NULL),
('9780000000007','Algorithms','CS301','ComputerSci',1,NULL),
('9780000000008','Microeconomics','ECON101','Economics',1,NULL),
('9780000000009','Macroeconomics','ECON201','Economics',1,NULL),
('9780000000010','Sociology Intro','SOC101','Sociology',1,NULL),
('9780000000011','Psychology I','PSY101','Psychology',1,NULL),
('9780000000012','English Writing','ENG101','English',1,NULL),
('9780000000013','World History','HIS101','History',1,NULL),
('9780000000014','Art Appreciation','ART101','Arts',1,NULL),
('9780000000015','Discrete Math','MATH201','Mathematics',1,NULL),
('9780000000016','Linear Algebra','MATH202','Mathematics',1,NULL),
('9780000000017','Statistics','STAT101','Statistics',1,NULL),
('9780000000018','Marketing Basics','MKT101','Business',1,NULL),
('9780000000019','Finance Intro','FIN101','Business',1,NULL),
('9780000000020','Accounting I','ACC101','Business',1,NULL),
('9780000000021','Networking I','NET101','IT',1,NULL),
('9780000000022','Cybersecurity','CYB101','IT',1,NULL),
('9780000000023','Operating Sys','CS302','ComputerSci',1,NULL),
('9780000000024','Database Sys','CS303','ComputerSci',1,NULL),
('9780000000025','AI Basics','CS401','ComputerSci',1,NULL),
('9780000000026','Machine Learn','CS402','ComputerSci',1,NULL),
('9780000000027','Digital Logic','ECE101','Engineering',1,NULL),
('9780000000028','Circuits I','ECE201','Engineering',1,NULL),
('9780000000029','Thermodynamics','ME101','Engineering',1,NULL),
('9780000000030','Statics','ME102','Engineering',1,NULL);


INSERT INTO Authors (ISBN, AuthorFName, AuthorLName) VALUES
('9780000000001','James','Stewart'),
('9780000000002','Hugh','Young'),
('9780000000002','Roger','Freedman'),
('9780000000003','Neil','Campbell'),
('9780000000004','Theodore','Brown'),
('9780000000005','John','Zelle'),
('9780000000006','Mark','Allen'),
('9780000000006','David','Reed'),
('9780000000007','Thomas','Cormen'),
('9780000000008','Paul','Krugman'),
('9780000000009','N','Gregory'),
('9780000000010','Anthony','Giddens'),
('9780000000011','David','Myers'),
('9780000000012','John','Smith'),
('9780000000013','Peter','Stearns'),
('9780000000014','Mary','Johnson'),
('9780000000015','Kenneth','Rosen'),
('9780000000016','Gilbert','Strang'),
('9780000000017','Robert','Hogg'),
('9780000000018','Philip','Kotler'),
('9780000000019','Stephen','Ross'),
('9780000000020','Charles','Horngren'),
('9780000000021','Tom','Thomas'),
('9780000000022','William','Stallings'),
('9780000000023','Abraham','Silberschatz'),
('9780000000024','Ramez','Elmasri'),
('9780000000024','Shamkant','Navathe'),
('9780000000025','Stuart','Russell'),
('9780000000026','Ian','Goodfellow'),
('9780000000027','Morris','Mano'),
('9780000000028','Charles','Alexander'),
('9780000000029','Yunus','Cengel'),
('9780000000030','Russell','Hibbeler');


INSERT INTO BookCopy (ISBN, BookEdition, YearPrinted, Price, Conditions, DateAdded, Status) VALUES
('9780000000001',1,2020,80,'New','2024-01-10','Sold'),
('9780000000002',1,2021,90,'Good','2024-01-11','In Store'),
('9780000000003',2,2019,70,'Fair','2024-01-12','Sold'),
('9780000000004',1,2022,95,'New','2024-01-13','In Store'),
('9780000000005',1,2021,60,'Used','2024-01-14','Sold'),
('9780000000006',2,2020,85,'Good','2024-01-15','In Store'),
('9780000000007',3,2022,110,'New','2024-01-16','Reserved'),
('9780000000008',1,2018,65,'Fair','2024-01-17','In Store'),
('9780000000009',1,2019,75,'Used','2024-01-18','Reserved'),
('9780000000010',1,2022,50,'New','2024-01-19','Sold'),
('9780000000011',1,2023,120,'Good','2024-01-20','Sold'),
('9780000000012',1,2023,55,'New','2024-01-21','In Store'),
('9780000000013',2,2017,45,'Used','2024-01-22','In Store'),
('9780000000014',1,2021,60,'Fair','2024-01-23','In Store'),
('9780000000015',1,2019,95,'New','2024-01-24','Reserved'),
('9780000000016',1,2022,85,'Good','2024-01-25','In Store'),
('9780000000017',2,2020,75,'Used','2024-01-26','In Store'),
('9780000000018',1,2021,65,'Fair','2024-01-27','In Store'),
('9780000000019',1,2023,100,'New','2024-01-28','In Store'),
('9780000000020',1,2021,90,'Good','2024-01-29','In Store'),
('9780000000021',1,2023,105,'New','2024-01-30','Sold'),
('9780000000022',1,2022,95,'Fair','2024-01-31','In Store'),
('9780000000023',1,2021,80,'Good','2024-02-01','In Store'),
('9780000000024',1,2022,120,'New','2024-02-02','In Store'),
('9780000000025',1,2023,130,'New','2024-02-03','In Store'),
('9780000000026',1,2023,115,'Good','2024-02-04','In Store'),
('9780000000027',2,2020,85,'Fair','2024-02-05','Reserved'),
('9780000000028',1,2021,95,'Used','2024-02-06','In Store'),
('9780000000029',1,2022,140,'New','2024-02-07','In Store'),
('9780000000030',1,2023,100,'Good','2024-02-08','In Store');


INSERT INTO Customers (CustomerName, CPassword, Email, CreatedDate) VALUES
('Alice Johnson','pass123','alice@example.com','2024-01-01'),
('Bob Smith','pass123','bob@example.com','2024-01-02'),
('Charlie Lee','pass123','charlie@example.com','2024-01-03'),
('Diana Cruz','pass123','diana@example.com','2024-01-04'),
('Ethan Brown','pass123','ethan@example.com','2024-01-05'),
('Fiona Davis','pass123','fiona@example.com','2024-01-06'),
('George White','pass123','george@example.com','2024-01-07'),
('Hannah Green','pass123','hannah@example.com','2024-01-08'),
('Ivan Black','pass123','ivan@example.com','2024-01-09'),
('Julia Adams','pass123','julia@example.com','2024-01-10');


INSERT INTO Staffs (StaffName, SPassword, Email, CreatedDate) VALUES
('Sarah Collins','staff123','sarah@example.com','2023-12-01'),
('Mark Johnson','staff123','mark@example.com','2023-12-02'),
('Emily Carter','staff123','emily@example.com','2023-12-03'),
('Nathan Blake','staff123','nathan@example.com','2023-12-04'),
('Olivia Turner','staff123','olivia@example.com','2023-12-05');


INSERT INTO Transactions (DateOfTransaction, CustomerID) VALUES
('2024-02-10',1),
('2024-02-11',2),
('2024-02-12',3),
('2024-02-13',4),
('2024-02-14',5),
('2024-02-15',6),
('2024-02-16',7),
('2024-02-17',8),
('2024-02-18',9),
('2024-02-19',10),
('2024-02-20',1),
('2024-02-21',3),
('2024-02-22',5),
('2024-02-23',7),
('2024-02-24',9);


INSERT INTO OrderLineItems (TransactionID, CopyID, OrderStatus, StaffID) VALUES
(1,3,'Fulfilled',1),
(2,5,'Fulfilled',2),
(3,8,'Cancelled',3),
(4,10,'Fulfilled',1),
(5,15,'Processing',4),
(6,18,'New',5),
(7,1,'Fulfilled',1),
(8,9,'Processing',2),
(9,13,'New',3),
(10,21,'Fulfilled',4),
(11,29,'Cancelled',5),
(12,7,'Processing',1),
(13,11,'Fulfilled',2),
(14,19,'New',3),
(15,27,'Processing',4);
