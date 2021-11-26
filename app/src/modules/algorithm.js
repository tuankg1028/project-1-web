import Helpers from "../helpers";
import Models from "../models";
import _ from 'lodash'
async function main() {
    try {
        const algorithm = "EM"
        const apps = await Models.Apps.find().limit(26)
        const answer = await Models.Answer.findOne()
        const tranningAppIds = _.map(apps, "id")
        const apps = apps[0]

        const ourPredictionApproach1 = await Helpers.Function.getOurPredictionApproach1(
            tranningAppIds,
            answer,
            app,
            algorithm
        );

        const ourPredictionApproach2 = await Helpers.Function.getOurPredictionApproach2(
            tranningAppIds,
            answer,
            app,
            algorithm
        );

        const ourPredictionApproach3 = await Helpers.Function.getOurPredictionApproach3(
            tranningAppIds,
            answer,
            app,
            algorithm
        );

        const ourPredictionApproach4 = await Helpers.Function.getOurPredictionApproach4(
            tranningAppIds,
            answer,
            app,
            algorithm
        );

        console.log("Prediction Approach 1 is: ", ourPredictionApproach1)
        console.log("Prediction Approach 2 is: ", ourPredictionApproach2)
        console.log("Prediction Approach 3 is: ", ourPredictionApproach3)
        console.log("Prediction Approach 4 is: ", ourPredictionApproach4)
    } catch (err) {
        console.log(err);
        continue;
    }
}

main()