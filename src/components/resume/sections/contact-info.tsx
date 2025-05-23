import { faker } from "@faker-js/faker";

export const contactInfo = () => {
    const email = faker.internet.email();
    const phone = faker.phone.number();
    const linkedin = `linkedin.com/in/${faker.internet.userName().toLowerCase()}`;
    const website = faker.internet.url();
    const location = `${faker.location.city()}, ${faker.location.state()}`;

    return (
        `
        <div>
            <h2><strong>Informações de Contato</strong></h2>
            <blockquote>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefone:</strong> ${phone}</p>
                <p><strong>LinkedIn:</strong> ${linkedin}</p>
                <p><strong>Website:</strong> ${website}</p>
                <p><strong>Localização:</strong> ${location}</p>
            </blockquote>
        </div>
        `
    )
} 