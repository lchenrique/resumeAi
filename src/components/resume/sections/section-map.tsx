import { personalInfo } from "./personal-info";
import { summary } from "./summary";
import { experience } from "./experience";
import { education } from "./education";
import { skills } from "./skills";
import { references } from "./references";
import { projects } from "./projects";
// import { certifications } from "./certifications";

export const sectionMap = {
    personalInfo: personalInfo,
    summary: summary,
    experience: experience,
    education: education,
    skills: skills,
    references: references,
    projects: projects,
    // certifications: certifications,
}   




export const getSectionContent = (section: keyof typeof sectionMap) => {
    return sectionMap[section]();
}
