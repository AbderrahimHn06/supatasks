import { createClient } from "@supabase/supabase-js";

const url = "https://ityjdfjuchcvvqmufibr.supabase.co";
const key = "sb_publishable_oCYlqjeaxDkZCnx12RkCxQ_OxCDItfG";

export const supabase = createClient(url, key);
