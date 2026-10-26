"use client";

import {SiteSettingsModule} from "../extensions";
import {AdminOnlyNotice} from "../admin-ui";
import {useAdmin} from "../admin-context";

export default function Page(){
 const {user}=useAdmin();
 if(user?.role!=="admin")return <AdminOnlyNotice/>;
 return <SiteSettingsModule/>;
}
