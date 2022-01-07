export interface HttpHeader {
  key: string;
  value: string;
}

export interface HttpConfig {
  username: string;
  password: string;
  headers: HttpHeader[];
}
