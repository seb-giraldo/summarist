import Footer from "../components/Footer";
import "./ChoosePlanPage.css";
import pricingTop from "../../assets/pricing-top.png";
import { IoDocumentTextSharp } from "react-icons/io5";
import { RiPlantFill } from "react-icons/ri";
import { FaHandshake, FaSpinner } from "react-icons/fa";
import { CreateFaqCard } from "../functions/CreateFaqCard";
import { useState } from "react";
import { getCheckoutUrl } from "../stripe/stripePayments";
import app from "../firebase";

const PRICE_IDS: Record<string, string> = {
  monthly: "price_1UEhGh4YAkniBq7693lhUdfp",
  yearly: "price_1UEbdr4YAkniBq76DfEGVaw1",
};

export default function ChoosePlanPage() {
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [chosenPlan, setChosenPlan] = useState("");
  const [error, setError] = useState(false);

  const upgradeToPremium = async () => {
    if (!chosenPlan) {
      setError(true);
      return;
    }

    setLoadingCheckout(true);
    setError(false);
    const priceId = chosenPlan;

    try {
      const checkoutUrl = await getCheckoutUrl(app, priceId);
      window.location.assign(checkoutUrl);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <div>
      <div className="plan__header--wrapper">
        <div className="plan__header">
          <div className="plan__title">Get unlimited access to many amazing books to read</div>
          <div className="plan__sub--title">Turn ordinary moments into amazing learning opportunities</div>
          <figure className="plan__img--mask">
            <img
              alt="pricing"
              src={pricingTop}
              width="860"
              height="722"
              loading="lazy"
              style={{ color: "transparent" }}
            ></img>
          </figure>
        </div>
      </div>
      <div className="row">
        <div className="container">
          <div className="plan__features--wrapper">
            <div className="plan__features">
              <figure className="plan__features--icon">
                <IoDocumentTextSharp />
              </figure>
              <div className="plan__features--text">
                <b>Key ideas in few min</b> with many books to read
              </div>
            </div>
            <div className="plan__features">
              <figure className="plan__features--icon">
                <RiPlantFill />
              </figure>
              <div className="plan__features--text">
                <b>3 million</b> people growing with Summarist everyday
              </div>
            </div>
            <div className="plan__features">
              <figure className="plan__features--icon">
                <FaHandshake />
              </figure>
              <div className="plan__features--text">
                <b>Precise recommendations</b> collections curated by experts
              </div>
            </div>
          </div>

          <div className="section__title">Choose the plan that fits you</div>

          <div
            className={`plan__card ${chosenPlan === PRICE_IDS.yearly && "plan__card--active"}`}
            onClick={() => setChosenPlan(PRICE_IDS.yearly)}
          >
            <div className="plan__card--circle">
              {chosenPlan === PRICE_IDS.yearly && <div className="plan__card--dot"></div>}
            </div>
            <div className="plan__card--content">
              <div className="plan__card--title">Premium Plus Yearly</div>
              <div className="plan__card--price">$99.99/year</div>
              <div className="plan__card--text">7-day free trial included</div>
            </div>
          </div>

          <div className="plan__card--separator">
            <div className="plan__separator">or</div>
          </div>

          <div
            className={`plan__card ${chosenPlan === PRICE_IDS.monthly && "plan__card--active"}`}
            onClick={() => setChosenPlan(PRICE_IDS.monthly)}
          >
            <div className="plan__card--circle">
              {chosenPlan === PRICE_IDS.monthly && <div className="plan__card--dot"></div>}
            </div>
            <div className="plan__card--content">
              <div className="plan__card--title">Premium Monthly</div>
              <div className="plan__card--price">$9.99/month</div>
              <div className="plan__card--text">No trial included</div>
            </div>
          </div>

          <div className="plan__card--cta">
            {error && <div>Please choose a plan to proceed.</div>}
            <span className="btn--wrapper">
              <button className="btn plan__card--btn" style={{ width: "300px" }} onClick={() => upgradeToPremium()}>
                {loadingCheckout ? <FaSpinner className="plan__spinner" /> : <span>Start your free 7-day trial</span>}
              </button>
            </span>
            <div className="plan__disclaimer">
              Cancel your trial at any time before it ends, and you won't be charged.
            </div>
          </div>

          <div className="faq__wrapper">
            {
              <>
                <CreateFaqCard
                  title="How does the free 7-day trial work?"
                  body=" Begin your complimentary 7-day trial with a Summarist annual membership. You are under no obligation
                to continue your subscription, and you will only be billed when the trial period expires. With Premium
                access, you can learn at your own pace and as frequently as you desire, and you may terminate your
                subscription prior to the conclusion of the 7-day free trial."
                />

                <CreateFaqCard
                  title=" Can I switch subscriptions from monthly to yearly, or yearly to monthly?"
                  body=" While an annual plan is active, it is not feasible to switch to a monthly plan. However, once the
                  current month ends, transitioning from a monthly plan to an annual plan is an option."
                />

                <CreateFaqCard
                  title="What's included in the Premium plan?"
                  body=" Premium membership provides you with the ultimate Summarist experience, including unrestricted entry
                  to many best-selling books high-quality audio, the ability to download titles for offline reading, and
                  the option to send your reads to your Kindle."
                />

                <CreateFaqCard
                  title="Can I cancel during my trial or subscription?"
                  body=" You will not be charged if you cancel your trial before its conclusion. While you will not have
                  complete access to the entire Summarist library, you can still expand your knowledge with one curated
                  book per day."
                />
              </>
            }
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
