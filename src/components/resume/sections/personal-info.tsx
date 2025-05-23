import { JSONContent } from "@tiptap/react";
import { ResumeTemplate } from "../renderer/types";
import { createLayoutConfig } from "@/lib/create-layout-config";
import { faker } from "@faker-js/faker";

export const personalInfo = () => {
    const name = faker.person.fullName();
    const job = faker.person.jobTitle();
    const email = faker.internet.email();
    const phone = faker.phone.number();
    return (
        `
        <div>
            <h1> <strong>${name}  </strong></h1>
            <h3><strong>${job}</strong></h3>
            <blockquote>
                <p>${email}</p>
                <p>${phone}</p>
            </blockquote>
        </div>
        <hr />
        `
    )
}
