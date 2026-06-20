import { faker } from '@faker-js/faker';
import type { AccountPayload } from '../api/types.js';

export interface TestUser {
  name: string;
  email: string;
  password: string;
  title: 'Mr' | 'Mrs';
  birthDay: string;
  birthMonth: string; // '1'..'12'
  birthYear: string;
  firstName: string;
  lastName: string;
  company: string;
  address1: string;
  address2: string;
  country: 'United States' | 'India' | 'Canada' | 'Australia' | 'Israel' | 'New Zealand' | 'Singapore';
  state: string;
  city: string;
  zipcode: string;
  mobile: string;
}

export function makeUser(overrides: Partial<TestUser> = {}): TestUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName, lastName, provider: `pw${Date.now()}.test` }).toLowerCase(),
    password: 'Passw0rd!23',
    title: 'Mr',
    birthDay: '10',
    birthMonth: '5',
    birthYear: '1990',
    firstName,
    lastName,
    company: faker.company.name(),
    address1: faker.location.streetAddress(),
    address2: faker.location.secondaryAddress(),
    country: 'United States',
    state: faker.location.state(),
    city: faker.location.city(),
    zipcode: faker.location.zipCode('#####'),
    mobile: faker.string.numeric(10),
    ...overrides,
  };
}

export function toAccountPayload(u: TestUser): AccountPayload {
  return {
    name: u.name,
    email: u.email,
    password: u.password,
    title: u.title,
    birth_date: u.birthDay,
    birth_month: u.birthMonth,
    birth_year: u.birthYear,
    firstname: u.firstName,
    lastname: u.lastName,
    company: u.company,
    address1: u.address1,
    address2: u.address2,
    country: u.country,
    zipcode: u.zipcode,
    state: u.state,
    city: u.city,
    mobile_number: u.mobile,
  };
}
