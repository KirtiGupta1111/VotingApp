const express = require("express");
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');
const Candidate = require("../models/candidate");

const checkAdminRole = async (userID)=>{
  try{
    const user =  await User.findById(userID);
    if(user.role === 'admin')
      {
        return true;
      }
x  }
  catch(err)
  {
    return false;
  }
}

router.post('/', jwtAuthMiddleware, async(req, res)=>{
  try{
    if(!(await checkAdminRole(req.user.id)))
     
        return res.status(403).json({message : 'user does not have admin role'})
    
   
   const data = req.body
   const newCandidate = new Candidate(data);
   const response = await newCandidate.save();
   console.log('data saved');

   res.status(200).json({response : response});
  }

  catch(err)
  {
   console.log(err);
   res.status(500).json({error : 'Internal Server Error'});
  }
});


// router.post('/login', async(req, res)=>{
//   try{
//     const{aadharCardNumber, password} = req.body;

//     const user = await User.findOne({aadharCardNumber: aadharCardNumber});

//     if(!user || (await user. comparePassword(password)))
//     {
//       return res.status(401).json({error : 'Invalid username or password'});
//     }
//        const payload = {
//         id: user.id,
//        }

//        const token = generateToken(payload);
//        res.json({token})
//   }

//   catch(err)
//   {
//     console.log(err);
//     res.status(500).json({error: 'Internal Server Error'});
//   }
// });


//profile route

// router.get('/profile', jwtAuthMiddleware, async(req, res)=>{
//   try{
//     const userData = req.user;

//     const userId = userData.id;
//     const user = await User.findById(userId);

//     res.status(200).json({user});

//   }
//   catch(err)
//   {
//     console.log(err);
//     res.status(500).json({error: 'Internal Server Error'});
//   }
// });


router.put('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
  try{
    if(!checkAdminRole(req.user.id))
      
        return res.status(403).json({message : 'user does not  have admin role'})

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter
        const updatedCandidateData = req.body; // Updated data for the person

        const response = await Person.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true, // Return the updated document
            runValidators: true, // Run Mongoose validation
        })

        if (!response) {
            return res.status(403).json({ error: 'Candidate not found' });
        }

        console.log(' Candidate data updated');
        res.status(200).json(response);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
});



router.delete('/:candidateID', jwtAuthMiddleware, async (req, res)=>{
  try{
    if(!checkAdminRole(req.user.id))
      
        return res.status(403).json({message : 'user does not have admin role'})

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter

        const response = await Person.findByIdAndDelete(candidateID); 

            
        if (!response) {
            return res.status(403).json({ error: 'Candidate not found' });
        }

        console.log(' Candidate deleted');
        res.status(200).json(response);
  }catch(err){
      console.log(err);
      res.status(500).json({error: 'Internal Server Error'});
  }
});


router.post('/vote/:candidateID', jwtAuthMiddleware, async(req,res)=>{
  candidateID = req.params.candidateID;
  userId = req.user.id;

  try{
    const candidate = await Candidate.findById(candidateID);
    if(!candidate)
      {
        return res.status(404).json({message : 'candidate not found'});
      }

      const user = await User.findById(userId);
      if(!user){
        return res.status(404).json({message: 'user not found'});
      }
      if(user.isVoted)
        {
          res.status(404).json({message : 'you have already voted..'});
        }

        if(user.role =='admin')
          {
            res.status(404).json({message : 'admin not allowed...'});
          }

          candidate.votes.push({user: userId})
          candidate.voteCount++;
          await candidate.save();

          user.isVoted = true
          await user.save();

          res.status(200).json({message : 'vote recorded successfully..'});
  }
  catch(err)
  {
     console.log(err);
     res.status(500).json({error : 'Internal Server Error..'});
    
  }
});



router.get('/vote/count', async (req, res) =>{
  try{

 const candidate= await Candidate.find().sort({voteCount: 'desc'});

 const voteRecord = candidate.map((data) => {
  return{
    party : data.party,
    count : data.voteCount
  }
 });

 return res.status(200).json(voteRecord)
 
  }
  catch(err)
  {
    console.log(err);
    res.status(500).json({message : 'Internal Server Error..'});
 

  }
})
module.exports = router;

