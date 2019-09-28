export interface ITransaction {
    id?: string;
    from_user_id: string;
    to_user_id: string;
    trip_id: string;
    amount: number;
    item: string;
    remarks: string;
    created_at?: Date;
    updated_at?: Date;
}