import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// DeepSeek API Configuration
const DEEPSEEK_ENDPOINT = process.env.DEEPSEEK_API_ENDPOINT as string;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_R1_KEY ;

// GoDaddy API Configuration
const GODADDY_API_KEY = process.env.GODADDY_API_KEY ;
const GODADDY_API_SECRET = process.env.GODADDY_API_SECRET;
const GODADDY_API_URL = process.env.GODADDY_API_URL ;

// Define the base prompt
const basePrompt = `
You are an expert domain name assistant that generates creative, relevant, and brandable domain names for any type of website: tech startups, small businesses, e-commerce stores, blogs, personal brands, and more.

Follow these rules carefully:

1. TLD Strategy:
- Use a variety of TLDs based on context: .com (default and most preferred), .io, .co, .net, .org, .app, .store, .online, .shop, .blog, .studio, .tech, .ai, etc.
- Always include at least three .com domains.
- Use TLDs that match the industry type if implied (e.g., .store for shopping, .tech for software, .blog for personal blog, .ai for AI startups).
- Avoid irrelevant TLDs (e.g., don't suggest .ai for a flower shop).

2. Naming Techniques:
- Combine keywords from the user's context (like books, tech, pets, fitness, finance, etc.) with emotional, modern, or catchy terms (e.g., spark, lab, hub, loop, cart, hive, drop, wise, nest, dash, zoom)
- Use portmanteaus, real words, or slight modifications that sound natural and brandable.
- Short, clean names are preferred (under 18 characters).

3. Validation:
- Avoid names that are hard to spell or pronounce
- Avoid trademarked or offensive words
- Avoid excessive use of numbers or symbols
- No hyphens

Format strictly as a simple list:
1. yourdomain.com
2. secondchoice.io
3. coolbrand.store
4. simpleidea.net
5. freshname.co
6. catchysite.org
7. ecommercehub.shop

No explanations, no commentary — just the list.
`;

export async function generateDomains(userPrompt: string): Promise<string> {
  // Combine the base prompt with user input
  const fullPrompt = `${basePrompt}\n\n${userPrompt}`;

  // Make request to DeepSeek API
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key not found in environment variables');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
  };

  const payload = {
    model: 'deepseek-r1',
    messages: [
      { role: 'system', content: 'You are a knowledgeable assistant.' },
      { role: 'user', content: fullPrompt }
    ]
  };

  try {
    const response = await axios.post(DEEPSEEK_ENDPOINT, payload, { headers });
    return response.data.choices[0].message.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('HTTP Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
    throw error;
  }
}

export function extractDomains(response: string): string[] {
  // Regex to match "number-dot" followed by domain names
  const pattern = /\d+\.\s*(\S+)/g;
  
  // Extract domain names using regex
  const matches = [];
  let match;
  while ((match = pattern.exec(response)) !== null) {
    matches.push(match[1]);
  }
  
  // Convert extracted domains to lowercase
  return matches.map(domain => domain.toLowerCase());
}

export async function checkDomainAvailability(domains: string[]): Promise<string[]> {
  const availableDomains: string[] = [];
  
  if (!GODADDY_API_KEY || !GODADDY_API_SECRET) {
    throw new Error('GoDaddy API credentials not found in environment variables');
  }

  const headers = {
    'Authorization': `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}`,
    'Accept': 'application/json'
  };

  for (const domain of domains) {
    try {
      // Make API request to check domain availability
      const response = await axios.get(`${GODADDY_API_URL}?domain=${domain}`, { headers });
      
      if (response.status === 200) {
        const data = response.data;
        if (data.available) {
          availableDomains.push(domain);
        }
      } else {
        console.error(`Error checking domain ${domain}: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`Error processing domain ${domain}:`, error.message);
        if (error.response) {
          console.error(`Response: ${JSON.stringify(error.response.data)}`);
        }
      } else {
        console.error(`Error processing domain ${domain}:`, error);
      }
    }
  }
  
  return availableDomains;
}