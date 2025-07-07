import ViewModel from "../models/view.model.js"

export const likePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    if(!postId){
      res
      .status(400)
      .json({
        success: false,
        message: "postId is Required",
      });
    }

    const view = await ViewModel.findOne({postId});

    if(!view){
      res
      .status(400)
      .json({
        success: false,
        message: "Post Not Found",
      });
    }

    const userIndex = view.likes.indexOf(req.userId);

    if(userIndex === -1){
      view.numberOfLikes += 1;
      view.likes.push(req.userId);
    }
    else{
      view.numberOfLikes -= 1;
      view.likes.splice(userIndex, 1);
    }

    await view.save();

    res
    .status(200)
    .json({
      success: true,
      data: {
        liked: userIndex === -1 ? false : true
      },
      message: "Post like toggled Successfully",
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Couldn't like Post",
      error: error
    });
  }
}