import { age } from "@/lib/age-helper";
import { connection } from "next/server";

export default async function CustomerAge({ dob }: { dob: string }) {
    await connection();
    const years = age(dob);
    return <>{years}</>;
}