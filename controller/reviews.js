const Campground = require('../models/campground');
const Review = require('../models/review')

module.exports.createReview = async(req,res)=>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    review.author = req.user._id;
    campground.reviews.push(review)
    const reviews = await Review.findById(review._id)
    await review.save();
    await campground.save()
    req.flash('success', 'Created New Review!')
    res.redirect(`/campgrounds/${campground._id}`)
    // res.send(review)
}

module.exports.deleteReview = async(req,res)=>{
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Deleted Review!')
    res.redirect(`/campgrounds/${id}`)
}