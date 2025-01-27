import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../models';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root' 
})
export class ProductService {
  constructor(private httpService: HttpService) {}

  getProducts(): Observable<Product[]> {
    return this.httpService.getProducts();
  }

  getProductById(id: number | string): Observable<Product | undefined> {
    const stringId = id.toString();
    return this.httpService.getProductById(stringId);
  }
}
