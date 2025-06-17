import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { likedTable } from "./db/schema.js";
import { and, eq } from "drizzle-orm";
import job from "./config/cron.js";


const app = express();
const PORT = ENV.PORT || 8000

if(ENV.NODE_ENV= "production")job.start()
app.use(express.json())


app.get("/api/health", (req,res)=>{
    res.status(200).json({success:true})
})


app.post("/api/favorites",async(req,res)=>{
    try {
        const {userId,recipeId,title,image,cookTime,servings} = req.body;

        if(!userId || !recipeId || !title){
            return res.status(400).json({error:'Missing required fields'})
        }

      const newLiked =  await db.insert(likedTable).values({
            userId,
            recipeId,
            title, 
            image,
            cookTime,
            servings
        }).returning()

        res.status(201).json(newLiked[0])

    } catch (error) {
        console.log("error adding favorite",error)
        res.status(500).json({error:'internal error'})
    }
})

app.get("/api/favorites/:userId", async(req,res)=>{
    try {
        const {userId} = req.params

       const userFavorite= await db.select().from(likedTable).where(eq(likedTable.userId,userId))
        res.json(userFavorite)
    } catch (error) {
        console.log("error fetching favorite",error)
        res.status(500).json({error:'internal error'}) 
    }
})

app.delete("/api/favorites/:userId/:recipeId", async(req,res)=>{
    try {
        const {userId, recipeId} = req.params

        await db.delete(likedTable).where(
            and(eq(likedTable.userId,userId), eq(likedTable.recipeId,parseInt(recipeId)))
        )

        res.status(200).json({message:'recipe deleted successfully'})
    } catch (error) { 
        console.log("error removing favorite",error)
        res.status(500).json({error:'internal error'}) 
    }
})
app.listen(PORT,()=>{
    console.log(`server is running on port:${PORT}`)
})