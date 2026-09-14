import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Customer, Employee, Office, Order, OrderDetail, Payment, ProductLine, Product } from './entities';
import { CustomersModule } from './modules/customers/customers.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { OfficesModule } from './modules/offices/offices.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrderDetailsModule } from './modules/order-details/order-details.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductLinesModule } from './modules/product-lines/product-lines.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', ''),
        database: configService.get<string>('DB_DATABASE', 'classicmodels'),
        entities: [
          Customer,
          Employee,
          Office,
          Order,
          OrderDetail,
          Payment,
          ProductLine,
          Product,
        ],
        synchronize: false, // Don't modify existing database schema
        logging: true,
      }),
    }),
    CustomersModule,
    EmployeesModule,
    OfficesModule,
    OrdersModule,
    OrderDetailsModule,
    PaymentsModule,
    ProductLinesModule,
    ProductsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
