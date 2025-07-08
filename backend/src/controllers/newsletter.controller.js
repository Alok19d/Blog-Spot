import { z } from 'zod';
import NewsletterModel from '../models/newsletter.model.js';

export const subscribeToNewsletter = async (req, res) => {
  try {
    const newsletterSchema = z.object({
      email: z.string()
    });

    const { email } = req.body;

    /* Input Validation */
    const validateInput = newsletterSchema.parse({
      email
    });

    /* Checking if Email already exists */
    const emailExists = await NewsletterModel.findOne({
      email
    });

    if(emailExists){
      res
      .status(200)
      .json({
        success: true,
        message: "You are already subscribed to our newsletter."
      });
      return;
    }
    
    await NewsletterModel.create({
      email
    });

    res
    .status(200)
    .json({
      success: true,
      message: "Thank you for subscribing to our newsletter!"
    });
  } catch (error) {
    console.log(error);
    if(error instanceof z.ZodError){
      res
      .status(400)
      .json({
        success: false,
        message: error.errors[0]?.message || "Input Validation Error",
        error: error
      });
      return;
    }
    
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to subscribe to newsletter.",
      error: error
    });
  }
}