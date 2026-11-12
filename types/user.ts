export type UserDetails = {
  name: string;
  mobileNumber: string;
  dateOfbirth: string;
  isprofileCompleted: boolean;
  user: {
    coustumerId: string;
    walletBalance: number;
  };
};