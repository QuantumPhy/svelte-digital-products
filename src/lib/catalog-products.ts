export interface CatalogProduct {
 id:number; name:string; price:number; originalPrice:number; description:string;
 image:string; category:string; rating:number; reviews:number; badge?:string;
 colors?:string[]; room?:string; inStock?:boolean; downloads?:string; author?:string;
}
export const catalogProducts: CatalogProduct[] = [
    {
      id: 1,
      name: "ProCode IDE Theme Bundle",
      description: "50+ stunning themes for VS Code, JetBrains, and more. Perfect for developers who want a beautiful coding environment.",
      price: 29,
      originalPrice: 49,
      rating: 4.9,
      reviews: 1284,
      category: "software",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=400&fit=crop&auto=format",
      badge: "Best Seller",
      downloads: "12.5k",
      author: "Alex Chen"
    },
    {
      id: 2,
      name: "Full-Stack Development Masterclass",
      description: "Complete course covering React, Node.js, PostgreSQL, and deployment. 40+ hours of content.",
      price: 89,
      originalPrice: 199,
      rating: 4.8,
      reviews: 856,
      category: "courses",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=400&fit=crop&auto=format",
      badge: "Featured",
      downloads: "8.2k",
      author: "David Park"
    },
    {
      id: 3,
      name: "UI Component Library Pro",
      description: "500+ customizable React & Vue components with full TypeScript support and documentation.",
      price: 79,
      originalPrice: 129,
      rating: 4.9,
      reviews: 2341,
      category: "templates",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=500&h=400&fit=crop&auto=format",
      badge: "Top Rated",
      downloads: "25.8k",
      author: "Sarah Miller"
    },
    {
      id: 4,
      name: "Design Systems Handbook",
      description: "Complete guide to building scalable design systems for enterprise applications.",
      price: 24,
      originalPrice: 39,
      rating: 4.7,
      reviews: 567,
      category: "ebooks",
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500&h=400&fit=crop&auto=format",
      badge: "New",
      downloads: "5.1k",
      author: "Emily Rose"
    },
    {
      id: 5,
      name: "AI Prompt Engineering Guide",
      description: "Master the art of prompt engineering for ChatGPT, Claude, and other AI models.",
      price: 19,
      originalPrice: 29,
      rating: 4.8,
      reviews: 423,
      category: "ebooks",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=400&fit=crop&auto=format",
      badge: "Trending",
      downloads: "7.3k",
      author: "James Wilson"
    },
    {
      id: 6,
      name: "SaaS Starter Kit",
      description: "Production-ready Next.js + Supabase template with auth, payments, and admin dashboard.",
      price: 149,
      originalPrice: 249,
      rating: 4.9,
      reviews: 892,
      category: "templates",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=400&fit=crop&auto=format",
      badge: "Premium",
      downloads: "4.2k",
      author: "Alex Chen"
    },
    {
      id: 7,
      name: "3D Icon Pack Pro",
      description: "500+ high-quality 3D icons in multiple formats. Perfect for modern UI design.",
      price: 39,
      originalPrice: 59,
      rating: 4.7,
      reviews: 634,
      category: "assets",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=400&fit=crop&auto=format",
      downloads: "9.8k",
      author: "Sarah Miller"
    },
    {
      id: 8,
      name: "DevOps Automation Scripts",
      description: "Collection of 100+ shell scripts for CI/CD, monitoring, and infrastructure automation.",
      price: 59,
      originalPrice: 89,
      rating: 4.8,
      reviews: 234,
      category: "software",
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=500&h=400&fit=crop&auto=format",
      downloads: "3.1k",
      author: "David Park"
    },
    {
      id: 9,
      name: "Mobile App UI Kit",
      description: "200+ screens and components for iOS and Android app design in Figma.",
      price: 69,
      originalPrice: 99,
      rating: 4.9,
      reviews: 1123,
      category: "templates",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=400&fit=crop&auto=format",
      badge: "Popular",
      downloads: "15.6k",
      author: "Emily Rose"
    },
    {
      id: 10,
      name: "Data Science Bootcamp",
      description: "Comprehensive Python course for data analysis, visualization, and machine learning.",
      price: 129,
      originalPrice: 249,
      rating: 4.8,
      reviews: 678,
      category: "courses",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=400&fit=crop&auto=format",
      badge: "Featured",
      downloads: "6.4k",
      author: "James Wilson"
    },
    {
      id: 11,
      name: "Notion Template Bundle",
      description: "50+ Notion templates for productivity, project management, and life organization.",
      price: 29,
      originalPrice: 49,
      rating: 4.6,
      reviews: 445,
      category: "templates",
      image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=400&fit=crop&auto=format",
      downloads: "11.2k",
      author: "Sarah Miller"
    },
    {
      id: 12,
      name: "Stock Photo Collection",
      description: "1000+ royalty-free stock photos for commercial use. High resolution.",
      price: 49,
      originalPrice: 79,
      rating: 4.5,
      reviews: 289,
      category: "assets",
      image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=500&h=400&fit=crop&auto=format",
      downloads: "8.9k",
      author: "Emily Rose"
    }
  ];
export function catalogProduct(id:string):CatalogProduct|undefined {
 if(!/^[1-9][0-9]*$/.test(id))return undefined;
 return catalogProducts.find(product=>String(product.id)===id);
}
