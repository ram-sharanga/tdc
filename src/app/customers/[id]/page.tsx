import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getCustomer } from "@/lib/repo";
import { age } from "@/lib/age-helper";
import StagePill from "@/components/StagePill";
import Stepper from "@/components/Stepper";
import InfoGroup from "@/components/InfoGroup";
import { STAGES } from "@/types/profile";

async function CustomerData({ params }: { params: Promise<{ id: string }> }) {
    await connection();
    const { id } = await params;
    console.log(id);
    const c = getCustomer(id);
    if (!c) notFound();

    return (
        <>
            <div className="dhead">
                <div className="who">
                    <span className="av">{c.first[0]}{c.last[0]}</span>
                    <div>
                        <h1>{c.first} {c.last}</h1>
                        <span className="muted">{age(c.dob)} years old in {c.city}</span>{" "}
                        <StagePill stage={c.stage} />
                    </div>
                </div>
            </div>
            <Stepper current={STAGES[4]} />
            <div className="groups">
                <InfoGroup title="Basics" pairs={[
                    ["Gender", c.gender], ["Date of birth", c.dob], ["Age", age(c.dob)],
                    ["Height", `${c.height} cm`], ["Marital status", c.maritalStatus],
                    ["Location", `${c.city}, ${c.country}`],
                ]} />
                <InfoGroup title="Education and Career" pairs={[
                    ["College", c.college], ["Degree", c.degree],
                    ["Company", c.company], ["Designation", c.designation],
                    ["Income", `${c.income.toLocaleString()} LPA`],
                ]} />
                <InfoGroup title="Family and Background" pairs={[
                    ["Religion", c.religion], ["Caste", c.caste],
                    ["Languages", c.languages],
                    ["Siblings", c.siblings],
                    ["Family type", c.family],
                ]} />
                <InfoGroup title="Values and Lifestyle" pairs={[
                    ["Want kids", c.kids], ["Open to relocate", c.relocate],
                    ["Open to pets", c.pets], ["Diet", c.diet],
                ]} />
                <InfoGroup title="Contact" pairs={[
                    ["Email", c.email], ["Phone", c.phone],
                ]} />
            </div>
        </>
    )
}

export default function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <main className="wrap">
            <Link href="/dashboard" className="back">{"<"} Back to customers</Link>
            <Suspense fallback={<p className="muted">Loading customer...</p>}>
                <CustomerData params={params} />
            </Suspense>
        </main>
    );
}