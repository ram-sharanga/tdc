import type { Customer } from "@/types/profile";

export const customers: Customer[] = [
    {
        id: "c1", first: "Priya", last: "Nair", gender: "Female", dob: "1996-03-14",
        city: "Chennai", country: "India", maritalStatus: "Never Married", stage: "Verified",
        email: "priya.nair@example.com", phone: "+91 98400 11223", height: 162,
        college: "Anna University", degree: "B.E. Computer Science", income: 18,
        company: "Zoho", designation: "Software Engineer", languages: "Tamil, English, Malayalam",
        siblings: 1, religion: "Hindu", caste: "Nair", kids: "Yes", relocate: "Maybe",
        pets: "Yes", diet: "Vegetarian", family: "Nuclear",
    },
    {
        id: "c2", first: "Rohit", last: "Kumar", gender: "Male", dob: "1993-08-02",
        city: "Pune", country: "India", maritalStatus: "Divorced", stage: "Profile Shared",
        email: "rohit.k@example.com", phone: "+91 98200 44556", height: 176,
        college: "VIT Vellore", degree: "B.Tech Mechanical", income: 32,
        company: "Tata Motors", designation: "Senior Engineer", languages: "Hindi, English, Marathi",
        siblings: 2, religion: "Hindu", caste: "Kshatriya", kids: "Maybe", relocate: "Yes",
        pets: "No", diet: "Non-Vegetarian", family: "Joint",
    },
    {
        id: "c3", first: "Ananya", last: "Iyer", gender: "Female", dob: "1994-11-21",
        city: "Bengaluru", country: "India", maritalStatus: "Never Married", stage: "Meeting Scheduled",
        email: "ananya.i@example.com", phone: "+91 99000 77889", height: 165,
        college: "BITS Pilani", degree: "MBA", income: 30,
        company: "Deloitte", designation: "Consultant", languages: "Tamil, English, Kannada",
        siblings: 0, religion: "Hindu", caste: "Iyer", kids: "Yes", relocate: "Yes",
        pets: "Maybe", diet: "Vegetarian", family: "Nuclear",
    },
    {
        id: "c4", first: "Imran", last: "Sheikh", gender: "Male", dob: "1991-05-09",
        city: "Hyderabad", country: "India", maritalStatus: "Never Married", stage: "Onboarded",
        email: "imran.s@example.com", phone: "+91 90300 12345", height: 174,
        college: "JNTU Hyderabad", degree: "B.Tech Electronics", income: 26,
        company: "Infosys", designation: "Tech Lead", languages: "Urdu, English, Telugu",
        siblings: 3, religion: "Muslim", caste: "Sheikh", kids: "Yes", relocate: "No",
        pets: "Maybe", diet: "Non-Vegetarian", family: "Joint",
    },
    {
        id: "c5", first: "Meera", last: "Pillai", gender: "Female", dob: "1992-01-30",
        city: "Kochi", country: "India", maritalStatus: "Divorced", stage: "Feedback",
        email: "meera.p@example.com", phone: "+91 94470 66778", height: 158,
        college: "NIT Calicut", degree: "B.Tech Civil", income: 22,
        company: "L&T", designation: "Project Manager", languages: "Malayalam, English",
        siblings: 1, religion: "Hindu", caste: "Pillai", kids: "Maybe", relocate: "Maybe",
        pets: "Yes", diet: "Non-Vegetarian", family: "Nuclear",
    }
];