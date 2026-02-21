"use client";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, CheckCircle, XCircle, MessageSquare } from "lucide-react";

export default function ProductReviewsManager({ product }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.ProductReview.filter({
        product_id: product.id,
      });
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
    setLoading(false);
  };

  const updateReviewStatus = async (reviewId, status) => {
    try {
      await base44.entities.ProductReview.update(reviewId, { status });
      fetchReviews();
    } catch (error) {
      console.error("Failed to update review:", error);
    }
  };

  const submitResponse = async (reviewId) => {
    try {
      await base44.entities.ProductReview.update(reviewId, {
        merchant_response: response,
        responded_at: new Date().toISOString(),
      });
      setResponse("");
      setRespondingTo(null);
      fetchReviews();
    } catch (error) {
      console.error("Failed to submit response:", error);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const statusCounts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Product Reviews</h3>
          <p className="text-sm text-gray-400">
            Manage customer reviews and ratings
          </p>
        </div>
        <div className="flex items-center gap-2">
          {renderStars(Math.round(averageRating))}
          <span className="text-sm text-gray-400">
            {averageRating.toFixed(1)} ({reviews.length} reviews)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-yellow-900/20 border-yellow-500/30 p-3">
          <div className="text-2xl font-bold text-yellow-400">
            {statusCounts.pending}
          </div>
          <div className="text-sm text-gray-400">Pending</div>
        </Card>
        <Card className="bg-green-900/20 border-green-500/30 p-3">
          <div className="text-2xl font-bold text-green-400">
            {statusCounts.approved}
          </div>
          <div className="text-sm text-gray-400">Approved</div>
        </Card>
        <Card className="bg-red-900/20 border-red-500/30 p-3">
          <div className="text-2xl font-bold text-red-400">
            {statusCounts.rejected}
          </div>
          <div className="text-sm text-gray-400">Rejected</div>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : reviews.length === 0 ? (
        <Card className="bg-gray-800 border-gray-700 p-8 text-center">
          <Star className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">No reviews yet for this product</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-gray-800 border-gray-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.customer_name}</span>
                    {review.verified_purchase && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        Verified Purchase
                      </Badge>
                    )}
                    <Badge
                      className={
                        review.status === "approved"
                          ? "bg-green-500/20 text-green-400 text-xs"
                          : review.status === "rejected"
                            ? "bg-red-500/20 text-red-400 text-xs"
                            : "bg-yellow-500/20 text-yellow-400 text-xs"
                      }
                    >
                      {review.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-400">
                      {new Date(review.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold mb-2">{review.title}</h4>
              )}

              {review.comment && (
                <p className="text-sm text-gray-300 mb-3">{review.comment}</p>
              )}

              {review.images?.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Review"
                      className="w-16 h-16 rounded object-cover"
                    />
                  ))}
                </div>
              )}

              {review.helpful_count > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
                  <ThumbsUp className="w-3 h-3" />
                  {review.helpful_count} found this helpful
                </div>
              )}

              {review.merchant_response && (
                <Card className="bg-gray-900 border-gray-700 p-3 mt-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1">
                        Merchant Response
                      </div>
                      <p className="text-sm text-gray-300">
                        {review.merchant_response}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {respondingTo === review.id ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Write your response..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => submitResponse(review.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Response
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRespondingTo(null);
                        setResponse("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  {review.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateReviewStatus(review.id, "approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateReviewStatus(review.id, "rejected")}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {!review.merchant_response && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRespondingTo(review.id)}
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Respond
                    </Button>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}