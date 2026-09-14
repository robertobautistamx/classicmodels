import type { Customer, Employee, Office, Order, Payment, Product, ProductLine } from '../types';

export const mockOffices: Office[] = [
  { officeCode: '1', city: 'San Francisco', phone: '+1 650 219 4782', addressLine1: '100 Market Street', addressLine2: 'Suite 300', state: 'CA', country: 'USA', postalCode: '94105', territory: 'NA' },
  { officeCode: '2', city: 'Boston', phone: '+1 617 283 9110', addressLine1: '155 Federal Street', state: 'MA', country: 'USA', postalCode: '02110', territory: 'NA' },
  { officeCode: '3', city: 'NYC', phone: '+1 212 555 3000', addressLine1: '523 East 56th Street', state: 'NY', country: 'USA', postalCode: '10022', territory: 'NA' },
  { officeCode: '4', city: 'Paris', phone: '+33 14 723 5555', addressLine1: '29 Rue des Pyramides', country: 'France', postalCode: '75001', territory: 'EMEA' },
  { officeCode: '5', city: 'Tokyo', phone: '+81 33 224 5000', addressLine1: '4-1 Kioicho', state: 'Chiyoda-ku', country: 'Japan', postalCode: '102-8578', territory: 'Japan' },
  { officeCode: '6', city: 'Sydney', phone: '+61 29 264 2451', addressLine1: '5-11 Regent Street', state: 'NSW', country: 'Australia', postalCode: '2038', territory: 'APAC' },
];

export const mockEmployees: Employee[] = [
  { employeeNumber: 1002, lastName: 'Murphy', firstName: 'Diane', extension: 'x5800', email: 'dmurphy@classicmodelcars.com', officeCode: '1', jobTitle: 'President' },
  { employeeNumber: 1056, lastName: 'Patterson', firstName: 'Mary', extension: 'x4611', email: 'mpatterso@classicmodelcars.com', officeCode: '1', reportsTo: 1002, jobTitle: 'VP Sales' },
  { employeeNumber: 1076, lastName: 'Firrelli', firstName: 'Jeff', extension: 'x9273', email: 'jfirrelli@classicmodelcars.com', officeCode: '1', reportsTo: 1002, jobTitle: 'VP Marketing' },
  { employeeNumber: 1165, lastName: 'Jennings', firstName: 'Leslie', extension: 'x3291', email: 'ljennings@classicmodelcars.com', officeCode: '1', reportsTo: 1056, jobTitle: 'Sales Rep' },
  { employeeNumber: 1188, lastName: 'Nishi', firstName: 'Mami', extension: 'x1011', email: 'mnishi@classicmodelcars.com', officeCode: '5', reportsTo: 1056, jobTitle: 'Sales Rep' },
  { employeeNumber: 1216, lastName: 'Patterson', firstName: 'Steve', extension: 'x4334', email: 'spatterson@classicmodelcars.com', officeCode: '2', reportsTo: 1056, jobTitle: 'Sales Rep' },
  { employeeNumber: 1286, lastName: 'Tseng', firstName: 'Foon Yue', extension: 'x2248', email: 'ftseng@classicmodelcars.com', officeCode: '3', reportsTo: 1056, jobTitle: 'Sales Rep' },
  { employeeNumber: 1323, lastName: 'Vanauf', firstName: 'George', extension: 'x4102', email: 'gvanauf@classicmodelcars.com', officeCode: '3', reportsTo: 1056, jobTitle: 'Sales Rep' },
];

export const mockCustomers: Customer[] = [
  { customerNumber: 103, customerName: 'Atelier graphique', contactLastName: 'Schmitt', contactFirstName: 'Carine', phone: '40.32.2555', addressLine1: '54, rue Royale', city: 'Nantes', country: 'France', postalCode: '44000', salesRepEmployeeNumber: 1370, creditLimit: 21000.00 },
  { customerNumber: 112, customerName: 'Signal Gift Stores', contactLastName: 'King', contactFirstName: 'Jean', phone: '7025551838', addressLine1: '8489 Strong St.', city: 'Las Vegas', state: 'NV', postalCode: '83030', country: 'USA', salesRepEmployeeNumber: 1165, creditLimit: 71800.00 },
  { customerNumber: 114, customerName: 'Australian Collectors, Co.', contactLastName: 'Ferguson', contactFirstName: 'Peter', phone: '03 9520 4555', addressLine1: '636 St Kilda Road', addressLine2: 'Level 3', city: 'Melbourne', state: 'Victoria', postalCode: '3004', country: 'Australia', salesRepEmployeeNumber: 1611, creditLimit: 117300.00 },
  { customerNumber: 119, customerName: 'La Rochelle Gifts', contactLastName: 'Labrune', contactFirstName: 'Janine', phone: '40.67.8555', addressLine1: '67, rue des Cinquante Otages', city: 'Nantes', country: 'France', postalCode: '44000', salesRepEmployeeNumber: 1370, creditLimit: 118200.00 },
  { customerNumber: 121, customerName: 'Baane Mini Imports', contactLastName: 'Bergulfsen', contactFirstName: 'Jonas', phone: '07-98 9555', addressLine1: 'Erling Skakkes gate 78', city: 'Stavern', country: 'Norway', postalCode: '4110', salesRepEmployeeNumber: 1504, creditLimit: 81700.00 },
  { customerNumber: 124, customerName: 'Mini Gifts Distributors Ltd.', contactLastName: 'Nelson', contactFirstName: 'Susan', phone: '4155551450', addressLine1: '5677 Strong St.', city: 'San Rafael', state: 'CA', postalCode: '97562', country: 'USA', salesRepEmployeeNumber: 1165, creditLimit: 210500.00 },
  { customerNumber: 128, customerName: 'Blauer See Auto, Co.', contactLastName: 'Keitel', contactFirstName: 'Roland', phone: '+49 69 66 90 2555', addressLine1: 'Lyonerstr. 34', city: 'Frankfurt', country: 'Germany', postalCode: '60528', salesRepEmployeeNumber: 1504, creditLimit: 59700.00 },
  { customerNumber: 129, customerName: 'Mini Wheels Co.', contactLastName: 'Murphy', contactFirstName: 'Julie', phone: '6505555787', addressLine1: '5557 North Circular Rd.', city: 'South San Francisco', state: 'CA', postalCode: '94217', country: 'USA', salesRepEmployeeNumber: 1165, creditLimit: 64600.00 },
];

export const mockProductLines: ProductLine[] = [
  { productLine: 'Classic Cars', textDescription: 'Attention scale models of classic cars from the 1920s through the 1970s.' },
  { productLine: 'Motorcycles', textDescription: 'Replicas of famous vintage and contemporary motorcycles.' },
  { productLine: 'Planes', textDescription: 'Detailed scale models of commercial aircraft and historical warplanes.' },
  { productLine: 'Ships', textDescription: 'Handcrafted models of historical sailing ships and modern liners.' },
  { productLine: 'Trains', textDescription: 'Classic steam locomotives and modern high-speed bullet train replicas.' },
  { productLine: 'Trucks and Buses', textDescription: 'Heavy-duty transport trucks, fire engines, and commercial buses.' },
  { productLine: 'Vintage Cars', textDescription: 'Exquisite antique car models from the turn of the century.' },
];

export const mockProducts: Product[] = [
  { productCode: 'S10_1678', productName: '1969 Harley Davidson Ultimate Chopper', productLine: 'Motorcycles', productScale: '1:10', productVendor: 'Min Lin Diecast', productDescription: 'Features replica original paint job, detailed engine and exhaust.', quantityInStock: 7933, buyPrice: 48.81, MSRP: 95.72 },
  { productCode: 'S10_1949', productName: '1952 Alpine Renault 1300', productLine: 'Classic Cars', productScale: '1:10', productVendor: 'Classic Metal Creations', productDescription: 'Turnable front wheels, opening bonnet and detailed dashboard.', quantityInStock: 7305, buyPrice: 98.58, MSRP: 214.30 },
  { productCode: 'S10_2016', productName: '1996 Moto Guzzi 1100i', productLine: 'Motorcycles', productScale: '1:10', productVendor: 'Highway 66 Miniatures', productDescription: 'Official Moto Guzzi licensed die-cast model with functional kickstand.', quantityInStock: 6625, buyPrice: 68.99, MSRP: 118.94 },
  { productCode: 'S10_4698', productName: '2003 Harley-Davidson Eagle Drag Bike', productLine: 'Motorcycles', productScale: '1:10', productVendor: 'Red Start Diecast', productDescription: 'Detailed chrome drag pipes and custom race flame scheme.', quantityInStock: 5582, buyPrice: 91.02, MSRP: 193.66 },
  { productCode: 'S10_4759', productName: '1936 Harley Davidson El Knucklehead', productLine: 'Motorcycles', productScale: '1:10', productVendor: 'Welly Diecast', productDescription: 'V-twin engine detail, leatherette spring saddle.', quantityInStock: 435, buyPrice: 24.23, MSRP: 60.57 },
  { productCode: 'S10_4962', productName: '1962 Lancia Aero', productLine: 'Classic Cars', productScale: '1:10', productVendor: 'Second Gear Diecast', productDescription: 'Aerodynamic bodywork with authentic rally race decals.', quantityInStock: 6791, buyPrice: 83.72, MSRP: 136.00 },
  { productCode: 'S12_1099', productName: '1968 Ford Mustang', productLine: 'Classic Cars', productScale: '1:12', productVendor: 'Autoart Studio Design', productDescription: 'Opening doors, hood, trunk, detailed V8 engine block.', quantityInStock: 68, buyPrice: 95.34, MSRP: 194.57 },
  { productCode: 'S12_1108', productName: '2001 Ferrari Enzo', productLine: 'Classic Cars', productScale: '1:12', productVendor: 'Second Gear Diecast', productDescription: 'Scuderia Red finish, gull-wing opening doors and V12 layout.', quantityInStock: 22, buyPrice: 95.59, MSRP: 207.80 },
];

export const mockOrders: Order[] = [
  { orderNumber: 10100, orderDate: '2025-01-06', requiredDate: '2025-01-13', shippedDate: '2025-01-10', status: 'Shipped', customerNumber: 121, comments: 'Delivered via express parcel.' },
  { orderNumber: 10101, orderDate: '2025-01-09', requiredDate: '2025-01-18', shippedDate: '2025-01-11', status: 'Shipped', customerNumber: 128 },
  { orderNumber: 10102, orderDate: '2025-01-10', requiredDate: '2025-01-18', shippedDate: '2025-01-14', status: 'Shipped', customerNumber: 181 },
  { orderNumber: 10103, orderDate: '2025-01-29', requiredDate: '2025-02-07', shippedDate: '2025-02-02', status: 'Shipped', customerNumber: 121 },
  { orderNumber: 10104, orderDate: '2025-01-31', requiredDate: '2025-02-09', shippedDate: '2025-02-01', status: 'In Process', customerNumber: 141, comments: 'Customer requested delayed shipment date.' },
  { orderNumber: 10105, orderDate: '2025-02-11', requiredDate: '2025-02-21', shippedDate: '2025-02-12', status: 'Shipped', customerNumber: 145 },
  { orderNumber: 10106, orderDate: '2025-02-17', requiredDate: '2025-02-24', shippedDate: '2025-02-21', status: 'Resolved', customerNumber: 278 },
  { orderNumber: 10107, orderDate: '2025-02-24', requiredDate: '2025-03-03', status: 'On Hold', customerNumber: 131, comments: 'Waiting for credit limit verification.' },
];

export const mockPayments: Payment[] = [
  { customerNumber: 103, checkNumber: 'HQ336336', paymentDate: '2025-01-19', amount: 14571.44 },
  { customerNumber: 112, checkNumber: 'JM555205', paymentDate: '2025-01-20', amount: 32641.98 },
  { customerNumber: 114, checkNumber: 'OM369661', paymentDate: '2025-01-22', amount: 11503.91 },
  { customerNumber: 119, checkNumber: 'DB933704', paymentDate: '2025-01-28', amount: 14901.89 },
  { customerNumber: 121, checkNumber: 'MA766194', paymentDate: '2025-02-02', amount: 50218.95 },
  { customerNumber: 124, checkNumber: 'KI13173', paymentDate: '2025-02-15', amount: 43868.54 },
  { customerNumber: 128, checkNumber: 'ND288764', paymentDate: '2025-02-20', amount: 33847.62 },
  { customerNumber: 129, checkNumber: 'WB658826', paymentDate: '2025-02-26', amount: 46656.94 },
];
