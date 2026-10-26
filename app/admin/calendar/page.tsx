"use client";

import {CalendarModule} from "../extensions";
import {useAdmin} from "../admin-context";

export default function Page(){
 const {cars}=useAdmin();
 return <CalendarModule cars={cars as any}/>;
}
