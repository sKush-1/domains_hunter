import { generateDomains, extractDomains, checkDomainAvailability } from './domainSuggestionService';

async function testDomainService() {
  try {
    console.log('Testing domain suggestion service...');
    
    // Test generating domains
    const userPrompt = 'I want to create a tech blog about AI and machine learning';
    console.log(`Generating domains for prompt: ${userPrompt}`);
    
    const aiResponse = await generateDomains(userPrompt);
    console.log('AI Response:');
    console.log(aiResponse);
    
    // Test extracting domains
    const domains = extractDomains(aiResponse);
    console.log('Extracted Domains:');
    console.log(domains);
    
    // Note: We won't test domain availability here as it requires valid API credentials
    console.log('Domain suggestion service test completed successfully!');
  } catch (error) {
    console.error('Error testing domain service:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDomainService();
}