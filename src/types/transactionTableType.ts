export interface Transaction {
  transactionid: number;
  categoryid: number;
  amountspent: number;
  transactiondate: string;
  categories?: {
    categoryid: string;
    categoryname: string;
    maxspendlimit?: number;
  };
  userid: string;
}
