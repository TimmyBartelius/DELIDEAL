import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private apiUrl = '/api/app/product-category';   //TODO: RÄTT ENDPOINT BEHÖVS

    constructor(private http: HttpClient) {}

    getCategories(): Observable<{ id: number; name: string }[]> {
        return this.http.get<{ id: number; name: string }[]>(this.apiUrl);
    }
}