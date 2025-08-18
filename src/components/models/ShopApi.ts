import { Api } from '../base/api';
import { IShopApi, ProductListDTO, Product, OrderRequestDTO, OrderResponseDTO } from '../../types';
import { API_URL } from '../../utils/constants';

export class ShopApi extends Api implements IShopApi {
    constructor(baseUrl: string = API_URL) {
        super(baseUrl);
    }

    async getProducts(): Promise<ProductListDTO> {
        const response = await this.get('/product/');
        return response as ProductListDTO;
      }
      
      async getProductById(id: string): Promise<Product> {
        const response = await this.get(`/product/${id}`);
        return response as Product;
      }
      
      async createOrder(data: OrderRequestDTO): Promise<OrderResponseDTO> {
        const response = await this.post('/order', data);
        return response as OrderResponseDTO;
      }
}