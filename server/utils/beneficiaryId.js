const { getPromisePool } = require('../config/database');

/**
 * Generate beneficiary ID based on first letters of name + sequential three-digit numbers
 * @param {string} firstName - First name of beneficiary
 * @param {string} lastName - Last name of beneficiary
 * @returns {Promise<string>} Generated beneficiary ID (e.g., JA001, HD002, etc.)
 */
const generateBeneficiaryId = async (firstName, lastName) => {
  try {
    // Validate that both names are provided
    if (!firstName || !lastName) {
      throw new Error('Both first name and last name are required for ID generation');
    }
    
    // Check if a beneficiary with the same name already exists
    const [existingRows] = await getPromisePool().query(
      'SELECT beneficiary_id FROM beneficiary_details WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?)',
      [firstName.trim(), lastName.trim()]
    );
    
    if (existingRows.length > 0) {
      throw new Error('A beneficiary with this name already exists');
    }
    
    // Generate prefix from first letters of first and last name
    const prefix = (firstName.trim().charAt(0) + lastName.trim().charAt(0)).toUpperCase();
    
    // Get the next available sequential number (global across all beneficiaries)
    const [rows] = await getPromisePool().query(
      'SELECT beneficiary_id FROM beneficiary_details ORDER BY CAST(SUBSTRING(beneficiary_id, 3) AS UNSIGNED) DESC LIMIT 1'
    );
    
    let nextNumber = 1;
    
    if (rows.length > 0) {
      const lastId = rows[0].beneficiary_id;
      // Extract the number part (after the first 2 letters)
      const numberPart = lastId.substring(2);
      const lastNumber = parseInt(numberPart, 10);
      
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    
    // Format with leading zeros to ensure 3 digits (e.g., 001, 002, ..., 999)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    // Return with prefix from first letters of name
    const generatedId = `${prefix}${formattedNumber}`;
    console.log(`Generated beneficiary ID: "${generatedId}" (length: ${generatedId.length})`);
    
    // Validate the generated ID length
    if (generatedId.length > 20) {
      throw new Error(`Generated beneficiary ID "${generatedId}" is too long (${generatedId.length} characters). Maximum allowed is 20.`);
    }
    
    return generatedId;
  } catch (error) {
    console.error('Error generating beneficiary ID:', error);
    throw error;
  }
};

module.exports = {
  generateBeneficiaryId
};
