import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, ThumbsUp, MessageCircle, CheckCircle, XCircle, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductReviewsManager({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
  }, [isOpen, product.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const productReviews = await base44.entities.ProductReview.filter({
        product_id: product.id
      }, "-created_date");
      setReviews(productReviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
    setLoading(false);
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      await base44.entities.ProductReview.update(reviewId, { status });
      toast.success(`Review ${status}`);
      fetchReviews();
      
      // Update product rating
      await updateProductRating();
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const submitResponse = async (reviewId) => {
    if (!response.trim()) return;

    try {
      const user = await base44.auth.me();
      await base44.entities.ProductReview.update(reviewId, {
        response: {
          text: response,
          responder: user.full_name || user.email,
          responded_at: new Date().toISOString()
        }
      });
      toast.success("Response posted");
      setRespondingTo(null);
      setResponse("");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to post response");
    }
  };

  const updateProductRating = async () => {
    const approvedReviews = reviews.filter(r => r.status === "approved");
    if (approvedReviews.length === 0) return;

    const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
    
    await base44.entities.EcommerceProduct.update(product.id, {
      average_rating: parseFloat(avgRating.toFixed(1)),
      review_count: approvedReviews.length
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-500/20 text-green-400";
      case "rejected": return "bg-red-500/20 text-red-400";
      case "flagged": return "bg-orange-500/20 text-orange-400";
      default: return "bg-yellow-500/20 text-yellow-400";
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Star className="w-4 h-4 mr-2" />
        Reviews ({product.review_count || 0})
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Product Reviews - {product.title}</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400">No reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              <Card className="p-4 bg-gray-800 border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {product.average_rating?.toFixed(1) || "0.0"}
                    </div>
                    {renderStars(Math.round(product.average_rating || 0))}
                    <div className="text-sm text-gray-400 mt-1">
                      {product.review_count || 0} reviews
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-2 text-center text-sm">
                    <div>
                      <div className="font-bold text-yellow-400">
                        {reviews.filter(r => r.status === "pending").length}
                      </div>
                      <div className="text-gray-400">Pending</div>
                    </div>
                    <div>
                      <div className="font-bold text-green-400">
                        {reviews.filter(r => r.status === "approved").length}
                      </div>
                      <div className="text-gray-400">Approved</div>
                    </div>
                    <div>
                      <div className="font-bold text-red-400">
                        {reviews.filter(r => r.status === "rejected").length}
                      </div>
                      <div className="text-gray-400">Rejected</div>
                    </div>
                    <div>
                      <div className="font-bold text-orange-400">
                        {reviews.filter(r => r.status === "flagged").length}
                      </div>
                      <div className="text-gray-400">Flagged</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Reviews List */}
              {reviews.map(review => (
                <Card key={review.id} className="p-4 bg-gray-800 border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        <Badge className={getStatusColor(review.status)}>
                          {review.status}
                        </Badge>
                        {review.verified_purchase && (
                          <Badge className="bg-blue-500/20 text-blue-400">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="font-medium">{review.title}</div>
                      <div className="text-sm text-gray-400">
                        by {review.customer_name} • {new Date(review.created_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-3">{review.comment}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-3">
                      {review.images.map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-16 h-16 object-cover rounded" />
                      ))}
                    </div>
                  )}

                  {review.response && (
                    <Card className="p-3 bg-gray-700 border-gray-600 mb-3">
                      <div className="text-sm font-medium text-blue-400 mb-1">
                        Response from {review.response.responder}
                      </div>
                      <p className="text-sm">{review.response.text}</p>
                    </Card>
                  )}

                  <div className="flex gap-2">
                    {review.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus(review.id, "approved")}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus(review.id, "rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus(review.id, "flagged")}
                        >
                          <Flag className="w-4 h-4 mr-2" />
                          Flag
                        </Button>
                      </>
                    )}
                    {!review.response && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRespondingTo(review.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Respond
                      </Button>
                    )}
                  </div>

                  {respondingTo === review.id && (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Write your response..."
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => submitResponse(review.id)}>
                          Post Response
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setRespondingTo(null);
                          setResponse("");
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}