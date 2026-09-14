export interface Customer {
  customerNumber: number;
  customerName: string;
  contactLastName: string;
  contactFirstName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  salesRepEmployeeNumber?: number;
  creditLimit?: number;
  salesRepEmployee?: Employee;
  orders?: Order[];
  payments?: Payment[];
}

export interface Employee {
  employeeNumber: number;
  lastName: string;
  firstName: string;
  extension: string;
  email: string;
  officeCode: string;
  reportsTo?: number;
  jobTitle: string;
  office?: Office;
  manager?: Employee;
  subordinates?: Employee[];
  customers?: Customer[];
}

export interface Office {
  officeCode: string;
  city: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  state?: string;
  country: string;
  postalCode: string;
  territory: string;
  employees?: Employee[];
}

export interface Order {
  orderNumber: number;
  orderDate: string;
  requiredDate: string;
  shippedDate?: string;
  status: 'Shipped' | 'In Process' | 'Cancelled' | 'Resolved' | 'Disputed' | 'On Hold' | string;
  comments?: string;
  customerNumber: number;
  customer?: Customer;
  orderDetails?: OrderDetail[];
}

export interface OrderDetail {
  orderNumber: number;
  productCode: string;
  quantityOrdered: number;
  priceEach: number;
  orderLineNumber: number;
  order?: Order;
  product?: Product;
}

export interface Payment {
  customerNumber: number;
  checkNumber: string;
  paymentDate: string;
  amount: number;
  customer?: Customer;
}

export interface ProductLine {
  productLine: string;
  textDescription?: string;
  htmlDescription?: string;
  image?: any;
  products?: Product[];
}

export interface Product {
  productCode: string;
  productName: string;
  productLine: string;
  productScale: string;
  productVendor: string;
  productDescription: string;
  quantityInStock: number;
  buyPrice: number;
  MSRP: number;
  productLineEntity?: ProductLine;
  orderDetails?: OrderDetail[];
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  data?: any[];
  dataType?: 'table' | 'chart' | 'summary';
  chartTitle?: string;
}
