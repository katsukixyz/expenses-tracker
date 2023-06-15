import { User } from "@/types/user";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useUserData() {
  const user = useUser();
  const supabase = useSupabaseClient();

  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error }: PostgrestSingleResponse<User> = await supabase
        .from("users")
        .select()
        .eq("uid", user?.id)
        .single();
      setUserData(data);
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  return userData;
}
