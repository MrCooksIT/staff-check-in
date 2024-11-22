// src/utils/processStaffData.js
const rawStaffData = `1001	Laurene	Abrahams	Admin	debtors@maristsj.co.za
1002	Desiree	Adams	Snr	adamsd@maristsj.co.za
// ... paste your entire staff list here`;

const processStaffData = () => {
  const staffArray = rawStaffData
    .trim()
    .split('\n')
    .map(line => {
      const [id, firstName, lastName, department, email] = line.split('\t');
      return {
        staffId: id,
        firstName,
        lastName,
        department,
        email,
        active: true, // Add additional fields
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    });

  return staffArray;
};

export const staffData = processStaffData();