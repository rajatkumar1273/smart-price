"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../dbConfig";
import { scrapeAmazonProduct } from "../scraper";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import Product from "@/models/productModel";
import { User } from "@/types";
import { generateEmailBody, sendEmail } from "../resend";

connectToDatabase();

export async function scrapeAndStoreProduct(productUrl: string) {
  if (!productUrl) {
    return;
  }

  try {
    const scrapedProduct = await scrapeAmazonProduct(productUrl);
    if (!scrapedProduct) {
      return;
    }

    let product = scrapedProduct;

    const existingProduct = await Product.findOne({ url: scrapedProduct.url });

    if (existingProduct) {
      const updatedPriceHistory: any = [
        ...existingProduct.priceHistory,
        { price: scrapedProduct.currentPrice },
      ];

      product = {
        ...scrapedProduct,
        priceHistory: updatedPriceHistory,
        lowestPrice: getLowestPrice(updatedPriceHistory),
        highestPrice: getHighestPrice(updatedPriceHistory),
        averagePrice: getAveragePrice(updatedPriceHistory),
      };
    }

    const newProduct = await Product.findOneAndUpdate(
      { url: scrapedProduct.url },
      product,
      { upsert: true, new: true }
    );

    revalidatePath(`/products/${newProduct._id}`);
    revalidatePath("/", "layout");

    const data = JSON.parse(JSON.stringify(newProduct));
    return data;
  } catch (error: any) {
    throw new Error(`Failed to create/update product: ${error.message}`);
  }
}

export async function getProductById(productId: string) {
  try {
    const product = await Product.findOne({ _id: productId });

    if (!product) return null;

    return product;
  } catch (error) {
    console.log(error);
  }
}

export async function getAllProducts() {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return products;
  } catch (error) {
    console.log(error);
  }
}

export async function getOtherProducts(productId: string) {
  try {
    const currentProduct = await Product.findById(productId);

    if (!currentProduct) return null;

    const otherProducts = await Product.find({
      _id: { $ne: productId },
    }).limit(4);

    return otherProducts;
  } catch (error) {
    console.log(error);
  }
}

export async function addUserEmailToProduct(
  productId: string,
  userEmail: string
) {
  try {
    const product = await Product.findById(productId);

    if (!product) {
      return { message: "Product not found.", status: 404 };
    }

    const userExists = product.users.some(
      (user: User) => user.email === userEmail
    );

    if (userExists) {
      return { message: "You are already tracking this product.", status: 400 };
    }

    if (!userExists) {
      product.users.push({ email: userEmail });

      await product.save();

      const emailContent = await generateEmailBody(product, "WELCOME");

      await sendEmail(emailContent, [userEmail]);

      return { message: "You are now tracking this product.", status: 200 };
    }
  } catch (error) {
    return { message: "Failed to add email to product.", status: 500 };
  }
}
