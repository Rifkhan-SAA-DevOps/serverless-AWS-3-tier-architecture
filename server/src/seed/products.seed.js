const { BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { randomUUID } = require('crypto');
const docClient = require('../db/dynamodb');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const now = new Date().toISOString();

const products = [
  // ORANGE
  {
    name: 'Valencia Orange',
    description: 'Sweet and juicy Valencia oranges, perfect for fresh juice and daily snacking.',
    price: 1200,
    stock: 50,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9',
    category_id: '00a2ec19-d02e-430d-ba05-82503a4a36bd',
    category_name: 'Orange',
  },
  {
    name: 'Navel Orange',
    description: 'Seedless navel oranges with bright flavor and easy-to-peel skin.',
    price: 1350,
    stock: 45,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e',
    category_id: '00a2ec19-d02e-430d-ba05-82503a4a36bd',
    category_name: 'Orange',
  },
  {
    name: 'Blood Orange',
    description: 'Premium blood oranges with deep red flesh and rich citrus taste.',
    price: 1800,
    stock: 30,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12',
    category_id: '00a2ec19-d02e-430d-ba05-82503a4a36bd',
    category_name: 'Orange',
  },
  {
    name: 'Mandarin Orange',
    description: 'Small sweet mandarins, easy to peel and ideal for kids.',
    price: 1500,
    stock: 60,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1603664454146-50b9bb1e7afa',
    category_id: '00a2ec19-d02e-430d-ba05-82503a4a36bd',
    category_name: 'Orange',
  },
  {
    name: 'Organic Orange',
    description: 'Fresh organic oranges grown without synthetic chemicals.',
    price: 2000,
    stock: 25,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b',
    category_id: '00a2ec19-d02e-430d-ba05-82503a4a36bd',
    category_name: 'Orange',
  },

  // APPLE
  {
    name: 'Red Delicious Apple',
    description: 'Crisp red apples with a mildly sweet flavor.',
    price: 1600,
    stock: 55,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
    category_id: 'e39e571a-f1f8-4cac-a021-f3886c1816fb',
    category_name: 'Apple',
  },
  {
    name: 'Green Apple',
    description: 'Tangy green apples with a firm bite, great for salads and snacks.',
    price: 1700,
    stock: 40,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2',
    category_id: 'e39e571a-f1f8-4cac-a021-f3886c1816fb',
    category_name: 'Apple',
  },
  {
    name: 'Fuji Apple',
    description: 'Sweet and crunchy Fuji apples with excellent freshness.',
    price: 1900,
    stock: 35,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a',
    category_id: 'e39e571a-f1f8-4cac-a021-f3886c1816fb',
    category_name: 'Apple',
  },
  {
    name: 'Royal Gala Apple',
    description: 'Juicy Royal Gala apples with a balanced sweet taste.',
    price: 1850,
    stock: 42,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a',
    category_id: 'e39e571a-f1f8-4cac-a021-f3886c1816fb',
    category_name: 'Apple',
  },
  {
    name: 'Organic Apple',
    description: 'Naturally grown organic apples, fresh and healthy.',
    price: 2200,
    stock: 28,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1576179635662-9d1983e97e1e',
    category_id: 'e39e571a-f1f8-4cac-a021-f3886c1816fb',
    category_name: 'Apple',
  },

  // GRAPES
  {
    name: 'Green Grapes',
    description: 'Fresh seedless green grapes with a sweet and crisp texture.',
    price: 1400,
    stock: 50,
    weight_kg: 0.5,
    image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f',
    category_id: '57f5495e-c111-41e6-8a6a-f696678350ce',
    category_name: 'Grapes',
  },
  {
    name: 'Black Grapes',
    description: 'Juicy black grapes with rich sweetness and natural flavor.',
    price: 1550,
    stock: 45,
    weight_kg: 0.5,
    image_url: 'https://images.unsplash.com/photo-1596363505729-4190a9506133',
    category_id: '57f5495e-c111-41e6-8a6a-f696678350ce',
    category_name: 'Grapes',
  },
  {
    name: 'Red Grapes',
    description: 'Sweet red grapes, ideal for fruit bowls and fresh juice.',
    price: 1650,
    stock: 38,
    weight_kg: 0.5,
    image_url: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443',
    category_id: '57f5495e-c111-41e6-8a6a-f696678350ce',
    category_name: 'Grapes',
  },
  {
    name: 'Seedless Grapes',
    description: 'Premium seedless grapes, easy to eat and perfect for kids.',
    price: 1800,
    stock: 34,
    weight_kg: 0.5,
    image_url: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f',
    category_id: '57f5495e-c111-41e6-8a6a-f696678350ce',
    category_name: 'Grapes',
  },
  {
    name: 'Organic Grapes',
    description: 'Fresh organic grapes grown with natural farming methods.',
    price: 2300,
    stock: 22,
    weight_kg: 0.5,
    image_url: 'https://images.unsplash.com/photo-1596363505729-4190a9506133',
    category_id: '57f5495e-c111-41e6-8a6a-f696678350ce',
    category_name: 'Grapes',
  },

  // BANANA
  {
    name: 'Cavendish Banana',
    description: 'Fresh Cavendish bananas, naturally sweet and energy-rich.',
    price: 900,
    stock: 80,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
    category_id: 'b1695cff-3979-45a1-937b-63b96a3f13e0',
    category_name: 'Banana',
  },
  {
    name: 'Red Banana',
    description: 'Soft and sweet red bananas with a creamy texture.',
    price: 1300,
    stock: 35,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919',
    category_id: 'b1695cff-3979-45a1-937b-63b96a3f13e0',
    category_name: 'Banana',
  },
  {
    name: 'Kolikuttu Banana',
    description: 'Popular Sri Lankan Kolikuttu bananas with excellent taste.',
    price: 1500,
    stock: 40,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224',
    category_id: 'b1695cff-3979-45a1-937b-63b96a3f13e0',
    category_name: 'Banana',
  },
  {
    name: 'Ambul Banana',
    description: 'Sri Lankan Ambul bananas with a slightly tangy sweet flavor.',
    price: 1200,
    stock: 45,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919',
    category_id: 'b1695cff-3979-45a1-937b-63b96a3f13e0',
    category_name: 'Banana',
  },
  {
    name: 'Organic Banana',
    description: 'Naturally grown organic bananas, fresh and chemical-free.',
    price: 1700,
    stock: 30,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
    category_id: 'b1695cff-3979-45a1-937b-63b96a3f13e0',
    category_name: 'Banana',
  },

  // MANGO
  {
    name: 'Alphonso Mango',
    description: 'Premium Alphonso mangoes with rich aroma and sweet golden flesh.',
    price: 2500,
    stock: 30,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078',
    category_id: '3248744b-320e-4eab-8243-a6b83e59c078',
    category_name: 'Mango',
  },
  {
    name: 'Karthakolomban Mango',
    description: 'Famous Sri Lankan Karthakolomban mangoes with excellent sweetness.',
    price: 2200,
    stock: 35,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716',
    category_id: '3248744b-320e-4eab-8243-a6b83e59c078',
    category_name: 'Mango',
  },
  {
    name: 'Willard Mango',
    description: 'Fresh Willard mangoes with soft texture and tropical flavor.',
    price: 2000,
    stock: 28,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed',
    category_id: '3248744b-320e-4eab-8243-a6b83e59c078',
    category_name: 'Mango',
  },
  {
    name: 'TJC Mango',
    description: 'Large TJC mangoes with sweet flesh and excellent quality.',
    price: 2400,
    stock: 25,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1605027990121-cbae9e0642df',
    category_id: '3248744b-320e-4eab-8243-a6b83e59c078',
    category_name: 'Mango',
  },
  {
    name: 'Organic Mango',
    description: 'Naturally ripened organic mangoes with fresh tropical sweetness.',
    price: 2800,
    stock: 20,
    weight_kg: 1,
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078',
    category_id: '3248744b-320e-4eab-8243-a6b83e59c078',
    category_name: 'Mango',
  },
];

function toDynamoProduct(payload) {
  const productId = randomUUID();
  const timestamp = new Date().toISOString();

  return {
    PutRequest: {
      Item: {
        PK: `PRODUCT#${productId}`,
        SK: 'METADATA',

        GSI1PK: 'PRODUCTS',
        GSI1SK: timestamp,

        GSI2PK: payload.category_id
          ? `CATEGORY#${payload.category_id}`
          : 'CATEGORY#UNCATEGORIZED',
        GSI2SK: timestamp,

        entityType: 'PRODUCT',
        productId,

        name: payload.name,
        description: payload.description || '',
        price: Number(payload.price),
        stock: Number(payload.stock || 0),
        weight_kg: payload.weight_kg ? Number(payload.weight_kg) : null,
        image_url: payload.image_url || '',

        categoryId: payload.category_id || null,
        categoryName: payload.category_name || null,

        isActive: true,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    },
  };
}

async function seedProducts() {
  if (!TABLE_NAME) {
    throw new Error('DYNAMODB_TABLE is missing in environment variables');
  }

  const writeRequests = products.map(toDynamoProduct);

  // DynamoDB BatchWrite supports max 25 items per request.
  const chunks = [];
  for (let i = 0; i < writeRequests.length; i += 25) {
    chunks.push(writeRequests.slice(i, i + 25));
  }

  for (const chunk of chunks) {
    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          [TABLE_NAME]: chunk,
        },
      })
    );
  }

  console.log(`✅ Seeded ${products.length} products successfully`);
}

seedProducts()
  .then(() => {
    console.log('✅ Product seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Product seed failed:', error);
    process.exit(1);
  });