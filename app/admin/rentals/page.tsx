"use client";

import {RentalsModule} from "../extensions";
import {useAdmin} from "../admin-context";

export default function Page(){
 const {cars}=useAdmin();
 return <RentalsModule cars={cars as any}/>;
}
