// 型定義: User
export interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
  }
  
  // 型定義: Rotation
  export interface Rotation {
    id: number;
    current_user: User | null;
  }
  
  // 型定義: MonthlyRotation
  export interface MonthlyRotation {
    week: number;
    user: string;
  }
  