use rm7gitasi7hl7iyi;

-- table for NumberOFCopies to use instead of NumberOfCopies Column
select ISBN, count(case when CopyStatus != "Sold" then 1 end) as NumberOfCopies
from BookCopy
Group by ISBN;

-- table for OrderAmount
Select t.TransactionID, sum(Price) as OrderAmount
from Transactions t join OrderLineItems oli on t.TransactionID = oli.TransactionID join BookCopy bc on oli.CopyID = bc.CopyID
group by t.TransactionID;

-- table for number of completed transaction per customer
select CustomerID, count(distinct t.TransactionID) as NumberOfOrder
from Transactions t join OrderLineItems oli on t.TransactionID = oli.TransactionID
where OrderStatus = "Fulfilled"
group by CustomerID;

-- START

-- Low Stock Alert

Select BookTitle, b.ISBN, group_concat(' ',AuthorName) as Authors
from Books b join BookCopy bc on b.ISBN = bc.ISBN join OrderLineItems oli on bc.CopyID = oli.CopyID 
join Transactions t on oli.TransactionID = t.TransactionID
join (select ISBN, concat(AuthorFName, ' ', AuthorLName) as AuthorName
from Authors) as t1 on b.ISBN = t1.ISBN
join (select ISBN, count(case when CopyStatus != "Sold" then 1 end) as NumberOfCopies
from BookCopy
Group by ISBN) as t2 on b.ISBN = t2.ISBN
where NumberOfCopies < 1 and DateOfTransaction >= date_add(current_timestamp(), INTERVAL -6 month) and OrderStatus != 'Cancelled'
group by b.ISBN
Order by ISBN; 

-- Inventory Valuation

select sum(Price) as Total_Inventory_Value 
from BookCopy
where CopyStatus != "Sold";

-- Condition Breakdown

select Conditions, count(Case when CopyStatus != "Sold" then 1 end) as NumberOfCopies
from BookCopy
group by Conditions
Order by NumberOfCopies desc;

-- Average Order Value

select avg(OrderAmount) as Average_Total_Amount
from (
Select t.TransactionID, sum(Price) as OrderAmount
from Transactions t join OrderLineItems oli on t.TransactionID = oli.TransactionID join BookCopy bc on oli.CopyID = bc.CopyID
where OrderStatus = "Fulfilled"
group by t.TransactionID
) as t1;

-- New User Count

select count(CustomerID) as New_User_Count
from Customers 
where CreatedDate >= date_add(current_timestamp(), interval -30 day);

-- Inactive Customer List

select distinct c.CustomerID, Email
from Customers c join Transactions t on c.CustomerID = t.CustomerID
where DateOfTransaction < date_add(current_timestamp(), interval -6 month)
group by c.CustomerID;


-- Data Discrepency

select b.ISBN as ErrorBook, OrderID as ErrorOrder
from Books b join BookCopy bc on b.ISBN = bc.ISBN
join (select ISBN, count(case when CopyStatus != "Sold" then 1 end) as NumberOfCopies
from BookCopy
Group by ISBN) as t1 on b.ISBN = t1.ISBN join OrderLineItems oli on bc.CopyID = oli.CopyID
where NumberOfCopies <1 and OrderStatus != "Fulfilled";

-- Customer Order Frequency

select c.CustomerID, CustomerName
from Customers c join 
(select CustomerID, count(distinct t.TransactionID) as NumberOfOrder
from Transactions t join OrderLineItems oli on t.TransactionID = oli.TransactionID
where OrderStatus = "Fulfilled"
group by CustomerID
) as t1 on c.CustomerID = t1.CustomerID
where NumberOfOrder > 3;

-- Sales by Book Condtion

select Conditions, sum(OrderAmount) as Total_Revenue_Generated
from OrderLineItems oli join BookCopy bc on oli.CopyID = bc.CopyID join
(Select t.TransactionID, sum(Price) as OrderAmount
from Transactions t join OrderLineItems oli on t.TransactionID = oli.TransactionID join BookCopy bc on oli.CopyID = bc.CopyID
group by t.TransactionID
) as t1 on oli.TransactionID = t1.TransactionID
where OrderStatus = "Fulfilled"
group by Conditions;

-- Slow Mover

select BookTitle, b.ISBN, NumberOfCopies
from Books b join 
(select ISBN, count(case when CopyStatus != "Sold" then 1 end) as NumberOfCopies
from BookCopy
Group by ISBN) as t1 on b.ISBN = t1.ISBN join BookCopy bc on b.ISBN = bc.ISBN 
left join
(select b.ISBN 
from Books b join BookCopy bc on b.ISBN = bc.ISBN join OrderLineItems oli on bc.CopyID = oli.CopyID
join Transactions t on oli.TransactionID = t.TransactionID
where DateOfTransaction >= date_add(current_timestamp(),interval -1 year)
group by ISBN) as t2 on b.ISBN = t2.ISBN
join OrderLineItems oli on oli.CopyID = bc.CopyID join Transactions t on oli.TransactionID = t.TransactionID
where NumberOfCopies > 10 and t2.ISBN is null 
group by b.ISBN
Order by NumberOfCopies desc
limit 10;

-- revenue by month


select month(DateOfTransaction) as months, sum(OrderAmount) as Revenue
from Transactions t join (
Select t.TransactionID, sum(Price) as OrderAmount
from Transactions t join OrderLineItems oli on t.TransactionID = oli.TransactionID join BookCopy bc on oli.CopyID = bc.CopyID
group by t.TransactionID) as t1 on t.TransactionID = t1.TransactionID
where month(DateOfTransaction) > month(date_add(current_timestamp(), INTERVAL -6 month))
group by months;
