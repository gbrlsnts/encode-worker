export interface HttpHeader {
  key: string;
  value: string;
}

export interface HttpConfig {
  url: string;
  username: string;
  password: string;
  headers: HttpHeader[];
}
