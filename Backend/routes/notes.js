const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const Note = require("../models/Note");

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  const notes = await Note.find({ user: req.user.id });
  res.json(notes);
});

router.post(
  "/addnote",
  fetchuser,
  [body("title", "enter valid title").isLength({ min: 3 })],
  async (req, res) => {
    try {
      const { title, description, tag } =  req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });

      const saveNote = await note.save();

      res.json(saveNote);
    } catch (error) {
        console.log(error.message);
    }
  }
);


//update node route 3:
router.put("/updatenotes/:id",fetchuser,
 async( req, res)=>{

    try {
        
    
    const {title, description, tag} = req.body;

    const newNote = {};
    if(title){
        newNote.title = title;
    }
    if(description){
        newNote.description = description;
    }
    if(title){
        newNote.tag = tag;
    }

    // find the note to be updated
    let note  = await Note.findById(req.params.id);
    if(!note){
        return res.status(400).send("not found");
    }
    if(note.user.toString() !== req.user.id){
        return res.status(400).send("not allowed");
    }

    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote},{new:true});
    res.json({note});}
    catch (error) {
        console.log(error);
    }
});


//delete node route 3:
router.delete("/deletenotes/:id",fetchuser,
 async( req, res)=>{

    try {
        
    
    const {title, description, tag} = req.body;

    

    // find the note to be updated
    let note  = await Note.findById(req.params.id);
    if(!note){
        return res.status(400).send("not found");
    }
    if(note.user.toString() !== req.user.id){
        return res.status(400).send("not allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({"success":"note has been deleted"});
} catch (error) {
        console.log(error);
}
});


module.exports = router;
