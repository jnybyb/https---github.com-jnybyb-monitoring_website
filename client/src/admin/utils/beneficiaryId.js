import { beneficiariesAPI } from '../services/api';

/**
 * Generate beneficiary ID by calling the server API
 * @param {string} firstName - First name of beneficiary
 * @param {string} lastName - Last name of beneficiary
 * @returns {Promise<string>} Generated beneficiary ID (e.g., JA001, HD002, etc.)
 */
const generateBeneficiaryId = async (firstName, lastName) => {
  try {
    const response = await beneficiariesAPI.generateId(firstName, lastName);
    return response.beneficiaryId;
  } catch (error) {
    console.error('Error generating beneficiary ID:', error);
    throw error;
  }
};

export { generateBeneficiaryId };
